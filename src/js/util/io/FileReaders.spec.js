'use strict';

import {expect} from 'chai';
import FS from 'fs';

import {LocalFileReader} from './FileReaders';

describe('LocalFileReader', function() {
	it('should read specific bytes', function() {
		var reader = new LocalFileReader('./test-data/single_sample.vcf.gz.tbi.uncompressed');
		expect(reader).to.exist;
  	return reader.bytes(0,4).then(function(buffer) {
			var magic = new Uint8Array([0x54, 0x42, 0x49, 0x01]);	
			expect(buffer).to.equal(buffer);
		});
	});
	
	it('should read entire file', function() {
		var reader = new LocalFileReader('./test-data/single_sample.vcf.gz.tbi.uncompressed');
		expect(reader).to.exist;
  	return reader.bytes().then(function(buffer) {
			var contents = FS.readFileSync(reader.path);  // returns Buffer
			expect(Buffer.compare(new Buffer(buffer), contents)).to.equal(0);
		});
	});
});
