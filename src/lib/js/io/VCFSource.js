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
	
	constructor(source: TabixIndexedFile) {
		this._source = source;
		
		// TODO: Parse VCF header
			
	}

	variants(ctg: string, pos: number, end: number) : Q.Promise<Array<VCFVariant>> {
		return this._source.records(ctg, pos, end).then(records => {
			return _.chain(records)
				.map(record => new VCFVariant(record))
				.value();
		});
	}
}

module.exports = VCFSource;
