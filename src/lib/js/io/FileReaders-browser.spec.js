'use strict';

import {expect} from 'chai';

import {LocalFileReader, RemoteFileReader} from './FileReaders';

function getTestArray() {
	// Contents of: './test-data/single_sample.vcf.gz.tbi.uncompressed'
	return new Uint8Array([
		0x54, 0x42, 0x49, 0x01, 0x01, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00,
		0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x23, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x05, 0x00, 0x00, 0x00, 0x63, 0x68, 0x72, 0x31, 0x00, 0x01, 0x00, 0x00, 0x00, 0x49, 0x12, 0x00,
		0x00, 0x01, 0x00, 0x00, 0x00, 0xd8, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x4b,
		0x01, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0xd8, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x00                                             
	]);
}

function getTestBlob() {
	return new Blob([getTestArray()], {type: 'application/octet-binary'});
}


describe('LocalFileReader', function() {
	it('should read specific bytes', function() {
		// Use Blob, the parent type of File for testing
		var reader = new LocalFileReader(getTestBlob());
		return reader.bytes(1,4).then(function(buffer) {
			var magic = new Uint8Array([0x42, 0x49, 0x01, 0x01]);	
			expect(buffer).to.eql(magic.buffer);
		});
	});
	
	it('should read entire file', function() {
		// Use Blob, the parent type of File for testing
		var blob = getTestBlob();
		var reader = new LocalFileReader(blob);
		return reader.bytes().then(function(buffer) {
			expect(buffer).to.eql(getTestArray().buffer);
		});
	});
});

describe('RemoteFileReader', function() {
	it('should read specific bytes', function() {
		var reader = new RemoteFileReader("/test-data/single_sample.vcf.gz.tbi.uncompressed");
		return reader.bytes(1,4).then(function(buffer) {
			var magic = new Uint8Array([0x42, 0x49, 0x01, 0x01]);	
			expect(buffer).to.eql(magic.buffer);
		});
	});

	it('should read entire file', function() {
		var reader = new RemoteFileReader("/test-data/single_sample.vcf.gz.tbi.uncompressed");
		return reader.bytes().then(function(buffer) {
			expect(buffer).to.eql(getTestArray().buffer);
		});
	});
});
