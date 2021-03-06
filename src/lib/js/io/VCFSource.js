/**
 * @flow
 */
'use strict';

import Q from 'q';
import _ from 'underscore';

import * as Errors from '../util/errors';
import * as Ref from '../features/ReferenceGenome';
import TabixIndexedFile from './TabixIndexedFile';
import VCFVariant from './VCFVariant';

class VCFSource {
  _source: TabixIndexedFile;
  _reference: Q.Promise<Ref.ReferenceGenome>;
  _samples: Q.Promise<Array<string>>;

  constructor(source: TabixIndexedFile, reference: ?Ref.ReferenceGenome) {
		this._source = source;

    var referenceResolver = Q.defer();
    if (reference !== undefined) {
      this._reference = Q(reference);
    } else {
      // Will only be used if reference is not specified
      this._reference = referenceResolver.promise;
    }

    this._samples = this._source.header().then(headerLines => {
      if (!headerLines[0].startsWith("##fileformat=VCF")) {
        throw new Error("Source is not a valid VCF file");
      }

      // 1. Look for a reference line
      let refIdx = _.findIndex(headerLines, (line) => line.startsWith("##reference="));
      if (refIdx != -1) {
        // Do we know this reference file?
        let referenceFrom = Ref.referenceFromFile(headerLines[refIdx].substring(12)); // index after '='
        if (referenceFrom !== undefined) {
          referenceResolver.resolve(referenceFrom);
        }
      }

      // 2. Parse contig lines to infer reference
      let contigs = _.chain(headerLines)
        .filter(line => line.startsWith("##contig="))
        .map(line => line.match(/ID=([^,>]+)/))
        .reject(match => match === null)
        .map(match => match[1])
        .value();
      if (contigs.length > 0) {
        let referenceFrom = Ref.referenceFromContigs(contigs);
        if (referenceFrom !== undefined) {
          referenceResolver.resolve(referenceFrom);
        }
      }

      // -OR- set hg19 as a default (will be a no-op if referenceResolver is already resolved)
      referenceResolver.resolve(Ref.hg19Reference);

      // Last line should be column labels
      var columns = _.last(headerLines).split("\t")
        if (columns[0] !== "#CHROM" || columns.length < 8) {
          throw new Error("Invalid column header line (#CHROM...)");
        }

      return columns.slice(9);
    });
	}

  reference() : Q.Promise<Ref.ReferenceGenome> {
    return this._reference;
  }

  samples() : Q.Promise<Array<string>> {
    return this._samples;
  }

  variants(ctg: string, pos: number, end: number) : Q.Promise<Array<VCFVariant>> {
    var queryResults = this._reference
      .then((ref) => { return ref.normalizeContig(ctg); })
      .then((normalizedCtg) => { return this._source.records(normalizedCtg, pos, end); });

    return Q.spread([queryResults, this._samples], (records, samples) => {
      return records.map(record => new VCFVariant(record, samples));
    }, err => {
      if (err instanceof Errors.ContigNotInIndexError)
        return [];
      else
        throw err;
    });
  }

  _synthVariant(ctg: string, pos: number, ref: string, alt: string) : Q.Promise<VCFVariant> {
    return Q.spread([this._reference, this._samples], (reference, samples) => {
      let synth_record = `${reference.normalizeContig(ctg)}\t${pos}\t.\t${ref}\t${alt}\t.\t.\t.`
      if (samples.length > 0)
        synth_record += "\tGT" + "\t0/0".repeat(samples.length);
      return new VCFVariant(synth_record, samples, true /* isSynth */);
    });
  }

	variant(ctg: string, pos: number, ref: string, alt: string, assumeRefRef: boolean = false) : Q.Promise<VCFVariant> {
    return this.variants(ctg, pos, pos).then(variants => {
			// Filter for exact position and allele match, if none found and assumeRefRef
			// is true, synthesize a variant with a Ref/Ref genotype
			let found_variant = variants
        .filter(variant => variant.ref == ref && variant.alt.indexOf(alt) != -1)
        .shift()
      if (!found_variant && assumeRefRef) {
        return this._synthVariant(ctg, pos, ref, alt);
      } else
        return found_variant;
		});
	}

}

export default VCFSource;
