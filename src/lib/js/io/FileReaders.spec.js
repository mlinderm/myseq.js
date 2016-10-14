'use strict';

import {expect} from 'chai';
import FS from 'fs';

import {LocalFileReader, RemoteFileReader} from './FileReaders';

describe('LocalFileReader', function() {
	it('should read specific bytes', function() {
		var reader = new LocalFileReader('./test-data/single_sample.vcf.gz.tbi.uncompressed');
		return reader.bytes(1,4).then(function(buffer) {
			var magic = new Uint8Array([0x42, 0x49, 0x01, 0x01]);	
			expect(buffer).to.eql(magic.buffer);
		});
	});
	
	it('should read entire file', function() {
		var testFile = './test-data/single_sample.vcf.gz.tbi.uncompressed';
		var reader = new LocalFileReader(testFile);
  	return reader.bytes().then(function(buffer) {
			var contents = FS.readFileSync(testFile);  // returns Buffer
			expect(Buffer.compare(new Buffer(buffer), contents)).to.equal(0);
		});
	});
});

describe('RemoteFileReader', function() {
	it('should read specific bytes', function() {
		var reader = new RemoteFileReader('http://localhost:8081/test-data/single_sample.vcf.gz.tbi.uncompressed');
		return reader.bytes(1,4).then(function(buffer) {
			var magic = new Uint8Array([0x42, 0x49, 0x01, 0x01]);	
			expect(buffer).to.eql(magic.buffer);
		});
	});
	
	it('should read entire file', function() {
		var reader = new RemoteFileReader('http://localhost:8081/test-data/single_sample.vcf.gz.tbi.uncompressed');
  	return reader.bytes().then(function(buffer) {
			// Local file read returns Buffer
			var contents = FS.readFileSync('./test-data/single_sample.vcf.gz.tbi.uncompressed');  
			expect(Buffer.compare(new Buffer(buffer), contents)).to.equal(0);
		});
	});
});
