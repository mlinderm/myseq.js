/**
 * @flow
 */
'use strict';

import Q from 'q';
import _ from 'underscore';

import VCFVariant from './VCFVariant';
import TabixIndexedFile from './TabixIndexedFile';

class VCFSource {
	_source: TabixIndexedFile;
    _samples: Q.Promise<Array<string>>;

	constructor(source: TabixIndexedFile) {
		this._source = source;

		// TODO: Parse VCF header
	    this._samples = this._source.header().then(headerLines => {
            if (!headerLines[0].startsWith("##fileformat=VCF")) {
                throw new Error("Source is not a valid VCF file");
            }

            // Last line should be column labels
            var columns = _.last(headerLines).split("\t")
            if (columns[0] !== "#CHROM" || columns.length < 8) {
                throw new Error("Invalid column header line (#CHROM...)");
            }

            return columns.slice(9);
        });
	}

	variants(ctg: string, pos: number, end: number) : Q.Promise<Array<VCFVariant>> {
		return Q.spread([this._source.records(ctg, pos, end), this._samples], (records, samples) => {
			return _.chain(records)
				.map(record => new VCFVariant(record, samples.length === 0 ? 8 : 9 + samples.length))
				.value();
		});
	}

	variantByVariant(query: VCFVariant, assumeRefRef: boolean = false) : Q.Promise<VCFVariant> {
		this.variants(query.contig, query.position, query.position).then(variants => {
			// Filter for exact position and allele match, if none found and assumeRefRef
			// is true, synthesize a variant with a Ref/Ref genotype
			//variants.filter()
		})
	}
}

module.exports = VCFSource;
