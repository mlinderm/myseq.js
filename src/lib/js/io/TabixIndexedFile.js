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
 * mirroring the behavior of gzip(1).
 */
function inflateGZip(buffer: ArrayBuffer): ArrayBuffer {
  return concatArrayBuffers(inflateConcatenatedGZip(buffer).map(x => x.buffer));
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
var TABIX_FORMAT = {

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
	for(let chunk of chunks) {
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
	_contigs: Q.Promise<Map<string,Map<number,Object>>>;
	_overlapFunction: Q.Promse<{(line: string, ctg: string, pos: number, end: number): boolean;}>;

	constructor(dataSource: AbstractFileReader, indexSource: AbstractFileReader) {
		var overlapFunction = Q.defer();
		this._source = dataSource; 
		this._contigs = indexSource.bytes().then(buffer => {
			var uncompressedIndex = inflateGZip(buffer);
			var parser = new jBinary(
				new jDataView(uncompressedIndex, 0, undefined, true /* little endian */), 
				TABIX_FORMAT
			);
			var index = parser.readAll();
				
			// Set overlap function based on index header
			var format = index.head.format;
			switch (format) {
				case 2:
					overlapFunction.resolve(vcfLineInRegion);
					break;
				default:
					overlapFunction.resolve(genericLineInRegion);
					break;
			}

			// Convert tabix names string to array
			index.head.names = index.head.names.replace(/\0+$/, '').split('\0');	
			
			// Create hash of contig names with hash of bins
			var contigs = new Map();
   		for(var r=0; r<index.head.n_ref; ++r) {
				var bins = new Map();
				var contig = index.indexseq[r];
				for (var b=0; b<contig.n_bin; ++b) {
					var bin = contig.bins[b];
					bins.set(bin.bin, bin.chunks);		
				}
				contig.bins = bins;

				contigs.set(index.head.names[r], contig);
			}
			return contigs;
		});
		this._overlapFunction = overlapFunction.promise;
	}

	_chunksForInterval(ctg: string, pos: number, end: number) : Q.Promise<Array<Chunk>> {
		return this._contigs.then(contigs => {
			var indices = contigs.get(ctg);
			if (indices === undefined) {
				throw new RangeError('Unknown contig: ' + ctg);
			}

			var bins = reg2bins(pos, end + 1);
			var chunks = _.chain(bins)
				.map(b => indices.bins.get(b))
				.filter(b => b !== undefined)
				.flatten()
				.value();
		
			// Apply linear index and other optimizations
			var minimumOffset = indices.intervals[Math.max(0, Math.floor(pos / 16384))];
			chunks = optimizeChunks(chunks, minimumOffset);

			return chunks;
		});
	}

	/**
	 * May return records outside range that need to be filtered
	 * by format-aware wrappers, e.g. VCF. This behavior is different
	 * than htslib which incorporates format aware region filtering into
	 * query/iteration.
	 */
	records(ctg: string, pos: number, end: number) : Q.Promise<Array<String>> {
		var chunksPromise = this._chunksForInterval(ctg, pos, end)
		return Q.spread([chunksPromise, this._overlapFunction], (chunks, overlapFunction) => {
			var decoder = new TextDecoder('utf-8');  // Tabix'd files are ASCII
		
			// Read data for each chunk to produce array-of-array of decoded lines 
			var allLines = Q.all(_.map(chunks, chunk => {
    		var cOffset = chunk.beg.coffset;
				var cBytes  = chunk.end.coffset - chunk.beg.coffset;
				return this._source.bytes(cOffset, cBytes).then(buffer => {
					var uBuffer = inflateGZip(buffer);
				
					var uOffset = chunk.beg.uoffset; // Start decoding at chunk's uncompressed offset
					var uView = new Uint8Array(uBuffer, uOffset);
				
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
