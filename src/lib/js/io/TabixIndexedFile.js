/**
 * @flow
 */

// This file contains code adapted from 
// https://github.com/jsa-aerial/JS-Binary-VCF-Tabix
// The license for which is copied below:

//--------------------------------------------------------------------------//
//                                                                          //
//                        B I N A R Y - V C F                               //
//                                                                          //
//                                                                          //
// Copyright (c) 2014-2014 Trustees of Boston College                       //
//                                                                          //
// Permission is hereby granted, free of charge, to any person obtaining    //
// a copy of this software and associated documentation files (the          //
// "Software"), to deal in the Software without restriction, including      //
// without limitation the rights to use, copy, modify, merge, publish,      //
// distribute, sublicense, and/or sell copies of the Software, and to       //
// permit persons to whom the Software is furnished to do so, subject to    //
// the following conditions:                                                //
//                                                                          //
// The above copyright notice and this permission notice shall be           //
// included in all copies or substantial portions of the Software.          //
//                                                                          //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,          //
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF       //
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND                    //
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE   //
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION   //
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION    //
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.          //
//                                                                          //
// Author: Jon Anthony                                                      //
//                                                                          //
//--------------------------------------------------------------------------//

// This file contains code adapted from
// https://github.com/hammerlab/pileup.js
// which uses the Apache 2.0 license included herein.

'use strict';

import * as Errors from '../util/errors';

import _ from 'underscore';
import Q from 'q';
import jDataView from 'jdataview';
import jBinary from 'jbinary';
import pako from 'pako/lib/inflate';
import {TextDecoder} from 'text-encoding';

import AbstractFileReader from './AbstractFileReader';

type PakoResult = {
    err: number;
    msg: string;
    buffer: ?ArrayBuffer;
    total_in: number;
}

type InflatedBlock = {
    offset: number;
    compressedLength: number;
    buffer: ArrayBuffer;
}

function inflateOneGZipBlock(buffer, position): PakoResult {
    var inflator = new pako.Inflate();
    inflator.push(buffer.slice(position));
    return {
        err: inflator.err,
        msg: inflator.msg,
        buffer: inflator.result ? inflator.result.buffer : null,
        total_in: inflator.strm.total_in
    };
}

/**
 * Tabix files are compressed with BGZF, which consists of many concatenated
 * gzip'd blocks. These blocks must be decompressed separately.
 * @param lastBlockStart Stop decompression at this byte offset
 */
function inflateConcatenatedGZip(buffer: ArrayBuffer, lastBlockStart?: number): InflatedBlock[] {
    var position = 0, blocks = [];
    if (lastBlockStart === undefined) {
        lastBlockStart = buffer.byteLength;
    }
    do {
        var result = inflateOneGZipBlock(buffer, position);
        if (result.err) {
            throw 'Gzip error: ' + result.msg;
        }
        if (result.buffer) {
            blocks.push({
                offset: position,
                compressedLength: result.total_in,
                buffer: result.buffer
            });
        }
        position += result.total_in;
    } while (position <= lastBlockStart && position < buffer.byteLength);

    return blocks;
}

function concatArrayBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
    var totalBytes = buffers.map(b => b.byteLength).reduce((a, b) => a + b, 0);
    var output = new Uint8Array(totalBytes);

    var position = 0;
    buffers.forEach(buffer => {
        output.set(new Uint8Array(buffer), position);
        position += buffer.byteLength;
    });

    return output.buffer;
}


/**
 * Inflate one or more gzip blocks in the buffer concatenating the results,
 * mirroring the behavior of gzip(1). Use lastBlockStart=0 to read a single
 * block.
 */
function inflateGZip(buffer: ArrayBuffer, lastBlockStart?: number): ArrayBuffer {
    return concatArrayBuffers(inflateConcatenatedGZip(buffer, lastBlockStart).map(x => x.buffer));
}

class VirtualOffset {
	coffset: number;  // Compressed offset
	uoffset: number;  // Uncompressed offset

	constructor(coffset: number, uoffset: number) {
    this.coffset = coffset;
    this.uoffset = uoffset;
  }

	compareTo(other: VirtualOffset): number {
    return this.coffset - other.coffset || this.uoffset - other.uoffset;
  }
}

type Chunk = {
	beg: VirtualOffset;	
	end: VirtualOffset;
}

// Tabix schema, as defined in http://samtools.github.io/hts-specs/tabix.pdf, adapted
// from https://github.com/jsa-aerial/JS-Binary-VCF-Tabix
const TABIX_FORMAT = {

    'jBinary.all': 'tabix',
    'jBinary.littleEndian': true,

    virtual_offset : jBinary.Template({
        setParams: function () {
            this.baseType = {
                uoffset: 'uint16',
                coffset_values: ['array', 'uint16', 3]
            };
        },
        read: function() {
            var raw = this.baseRead();
            return new VirtualOffset(
                raw.coffset_values[0] + raw.coffset_values[1] * 65536 + raw.coffset_values[2] * 4294967296,
                raw.uoffset
            );	
        }
    }),

	header: {
		magic:   ['string', 4],
		n_ref:   'int32',
		format:  'int32',
		col_seq: 'int32',
		col_beg: 'int32',
		col_end: 'int32',
		meta:    'int32',
		skip:    'int32',
		l_nm:    'int32',
		names:   ['string', function(context){ return context.l_nm; }]
	},

	chunk: {
		beg: 'virtual_offset',
		end: 'virtual_offset'
	},

	bin: {
		bin:      'uint32',
		n_chunk:  'int32',
		chunks:   ['array', 'chunk', function(context){ return context.n_chunk; }]
	},

	index: {
		n_bin:     'int32',
		bins:      ['array', 'bin', function(context) { return context.n_bin; }],
		n_intv:    'int32',
		intervals: ['array', 'virtual_offset', function(context) { return context.n_intv; }]
	},

	tabix: {
		head:     'header',
		indexseq: ['array', 'index', function(context) { return context.head.n_ref; }]
	}

};

// Region-to-bins, as defined in http://samtools.github.io/hts-specs/tabix.pdf,
// adapted from https://github.com/hammerlab/pileup.js
function reg2bins(beg, end) {
    var k, list = [];
    --end;
    list.push(0);
    for (k =    1 + (beg>>26); k <=    1 + (end>>26); ++k) list.push(k);
    for (k =    9 + (beg>>23); k <=    9 + (end>>23); ++k) list.push(k);
    for (k =   73 + (beg>>20); k <=   73 + (end>>20); ++k) list.push(k);
    for (k =  585 + (beg>>17); k <=  585 + (end>>17); ++k) list.push(k);
    for (k = 4681 + (beg>>14); k <= 4681 + (end>>14); ++k) list.push(k);
    return list;
}

function optimizeChunks(chunks: Array<Chunk>, minimumOffset: VirtualOffset): Array<Chunk> {
    chunks.sort((l, r) => {
        return l.beg.compareTo(r.beg) || l.end.compareTo(r.end);
    });

    var newChunks = [];
    for (let chunk of chunks) {
        if (chunk.end.compareTo(minimumOffset) < 0) {
            // Linear index optimization
            continue;
        }
        if (newChunks.length === 0) {
            newChunks.push(chunk);
        } else {
            // Merge overlapping or adjacent chunks
            var lastChunk = newChunks[newChunks.length - 1];
            if (chunk.beg.compareTo(lastChunk.end) > 0) {
                newChunks.push(chunk);
            } else {
                lastChunk.end = chunk.end;
            }
        }
    }

	return newChunks;
}

function genericLineInRegion(line: string, ctg: string, pos: number, end: number) {
	return true;
}

function vcfLineInRegion(line: string, ctg: string, pos: number, end: number) {
	var fields = line.split('\t',8);
	if (fields[0] !== ctg) { // CHROM doesn't match
		return false;
	}
	
	var POS = parseInt(fields[1]);
	if (POS > end) { // POS beyond "end"
		return false;
	}
	
	// Determine END of VCF record, including END specified in INFO field	
	var foundEND = /END=(\d+)/.exec(fields[7]);
	var END = foundEND ? parseInt(foundEND[1]) : POS + fields[3].length - 1;	
	if (END < pos) {
		return false;
	}

	return true;
}

class TabixIndexedFile {
	_source: AbstractFileReader;
  _indexBuffer: Q.Promise<ArrayBuffer>;

  _overlapFunction: Q.Promise<{(line: string, ctg: string, pos: number, end: number): boolean;}>;
  _commentCharacter: Q.Promise<string>;
  _contigs: Q.Promise<Map<string,Object>>;

  constructor(dataSource: AbstractFileReader, indexSource: AbstractFileReader) {
    this._source = dataSource; 
    
    var indexBuffer = Q.defer();
    var overlapFunction = Q.defer();
    var commentCharacter = Q.defer();

    this._indexBuffer = indexBuffer.promise;
    this._overlapFunction = overlapFunction.promise;
    this._commentCharacter = commentCharacter.promise;

    this._contigs = indexSource.bytes().then(buffer => {
      const uncompressedIndex = inflateGZip(buffer);
      indexBuffer.resolve(uncompressedIndex);
      
      let view = new jDataView(uncompressedIndex, 0, undefined, true /* little endian */);
      let parser = new jBinary(view, TABIX_FORMAT);
      
      // Check for valid magic string
      if (parser.read(TABIX_FORMAT.header.magic, 0 /* Don't advance pointer */) !== "TBI\x01") {
        throw new Error("Invalid index file");
      }

      // Parse header with metadata
      let head = parser.read(TABIX_FORMAT.header)
      
      // Set overlap function based on index header
      let format = head.format;
      switch (format) {
        case 2:
          overlapFunction.resolve(vcfLineInRegion);
          break;
        default:
          overlapFunction.resolve(genericLineInRegion);
          break;
      }

      // Extract comment character
      commentCharacter.resolve(String.fromCharCode(head.meta));
    
      // Compute contig indices to faciliate independent parsing
      let names = head.names.replace(/\0+$/, '').split('\0');
      let contig2Index = new Map();
      
      for (let r=0; r < head.n_ref; ++r) {
        let contigBufferStart = view.tell();
                
        // Determine end of contig index information
        let num_bins = view.getInt32();
        for (let b=0; b < num_bins; ++b) {
          view.getUint32(); // bin ID
          let num_chunks = view.getInt32();
          view.skip(num_chunks * 16);  // 16 bytes per chunk

        }
        view.skip(view.getInt32() * 8);  // 8 bits per interval element

        contig2Index.set(names[r], {
          bytes: [contigBufferStart, view.tell()],
          index: undefined
        });
      }

      return contig2Index;
    });
    
  }

	_chunksForInterval(ctg: string, pos: number, end: number) : Q.Promise<Array<Chunk>> {
		return this._contigs.then(contigs => {
			let lazyIndex = contigs.get(ctg);
			if (!lazyIndex) {
				throw new Errors.ContigNotInIndexError('Unknown contig: ' + ctg);
      }
      
      if (!lazyIndex.index) {
        // Lazily parse index if needed
        return this._indexBuffer.then(buffer => {
          let [start, stop] = lazyIndex.bytes
          
          let view = new jDataView(buffer, start, stop-start, true /* little endian */);
          let parser = new jBinary(view, TABIX_FORMAT);
          
          lazyIndex.index = parser.read(TABIX_FORMAT.index);
          return lazyIndex.index;
        });
      } else {
        return Q.when(lazyIndex.index);
      }
    }).then(index => {
			let bins = reg2bins(pos, end + 1);
			let chunks = _.chain(index.bins)
        .filter(b => bins.indexOf(b.bin) >= 0)
        .map(b => b.chunks)
				.flatten()
				.value();
		
			// Apply linear index and other optimizations
			let minimumOffset = index.intervals[Math.max(0, Math.floor(pos / 16384))];
			chunks = optimizeChunks(chunks, minimumOffset);

			return chunks;
		});
	}

  _fetchHeader(offset: number) :  Q.Promise<Array<String>> {
    // Read up to a single compressed block (no more than 64k)
    return Q.spread([this._source.bytes(offset, 65536), this._commentCharacter], (buffer, comment) => {
      var uBuffer = inflateGZip(buffer, 0 /* Read single block*/);
      var uView = new Uint8Array(uBuffer, 0, uBuffer.byteLength)

      var decoder = new TextDecoder('utf-8');  // Tabix'd files are ASCII
      var lines = decoder.decode(uView).split('\n');
      if (_.last(lines).startsWith(comment)) {
        // Need to fetch additional chunks
        return this._fetchHeader(offset + 65536).then(nextLines => {
          lines = lines.concat(nextLines);   
        });
      } else {
        var last = _.findLastIndex(lines, line => line.startsWith(comment));
        lines.splice(last + 1);
        return lines;
      }          
    });
  }

  header() : Q.Promise<Array<String>> {
    return this._fetchHeader(0);       
  }

	records(ctg: string, pos: number, end: number) : Q.Promise<Array<String>> {
		var chunksPromise = this._chunksForInterval(ctg, pos, end)
		return Q.spread([chunksPromise, this._overlapFunction], (chunks, overlapFunction) => {
			var decoder = new TextDecoder('utf-8');  // Tabix'd files are ASCII
		
			// Read data for each chunk to produce array-of-array of decoded lines 
			var allLines = Q.all(_.map(chunks, chunk => {
    		    var cOffset = chunk.beg.coffset;
				var cBytes  = chunk.end.coffset - chunk.beg.coffset;
				
				// At a minimum read at least one compressed block (which must be less than 64k)
				return this._source.bytes(cOffset, (cBytes == 0 ? 65536 : cBytes)).then(buffer => {
					var uBuffer = (cBytes == 0) ? inflateGZip(buffer, 0 /* Read single block*/) : inflateGZip(buffer);
				
					var uOffset = chunk.beg.uoffset; // Start decoding at chunk's uncompressed offset
					var uBytes  = (cBytes == 0 ? chunk.end.uoffset : uBuffer.byteLength) - chunk.beg.uoffset;
					var uView = new Uint8Array(uBuffer, uOffset, uBytes);
					
					return _.chain(decoder.decode(uView).split('\n'))
						.reject(line => line.length === 0)
						.filter(line => overlapFunction(line, ctg, pos, end))
						.value();
				});
			}));
			
			return allLines.then(lines => {
				return _.flatten(lines);	
			});
		});
	}
}


module.exports = TabixIndexedFile;
