/**
 * @flow
 */
'use strict';

import Q from 'q';
import _ from 'underscore';

import { ReferenceGenome, hg19Reference } from '../features/ReferenceGenome';
import TabixIndexedFile from './TabixIndexedFile';
import VCFVariant from './VCFVariant';

class VCFSource {
    _source: TabixIndexedFile;
    _reference: ReferenceGenome;

    _samples: Q.Promise<Array<string>>;
	
	constructor(source: TabixIndexedFile, reference: ?ReferenceGenome) {
		this._source = source;
        
        if (reference === undefined) {
            // TODO: Infer reference from Tabix file or VCF header
            this._reference = hg19Reference;
        } else {
            this._reference = reference;
        }
            
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
        var normalizedCtg = this._reference.normalizeContig(ctg);
        return Q.spread([this._source.records(normalizedCtg, pos, end), this._samples], (records, samples) => {
			return _.chain(records)
				.map(record => new VCFVariant(record, samples.length === 0 ? 8 : 9 + samples.length))
				.value();
		});
	}
}

module.exports = VCFSource;
