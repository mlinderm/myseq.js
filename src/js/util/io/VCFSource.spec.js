'use strict';

import {expect} from 'chai';

import VCFSource from './VCFSource';

describe('VCFSource', function() {
	function getTestSource() {
		return VCFSource.createFromFile('/test-data/simple_sample.vcf.gz');
	}


	it('should load tabix VCF', function() {
		var source = getTestSource();
  	expect(source).to.exist;
	});	
});
