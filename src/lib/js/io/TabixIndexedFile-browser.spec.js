'use strict';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
let expect = chai.use(chaiAsPromised).expect

import {LocalFileReader} from './FileReaders';
import TabixIndexedFile from './TabixIndexedFile';

describe('TabixIndexedFile', function() {
	function getFileArray() {
		// './test-data/single_sample.vcf.gz'
		return new Uint8Array([	
			0x1f, 0x8b, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0x06, 0x00, 0x42, 0x43, 0x02, 0x00,
			0x4a, 0x01, 0x6d, 0x91, 0x51, 0x6b, 0x83, 0x30, 0x14, 0x85, 0x9f, 0x6f, 0x7f, 0xc5, 0xa5, 0xbe,
			0xca, 0xa6, 0x65, 0xb0, 0xc2, 0x96, 0x41, 0xa6, 0xb5, 0x13, 0x5a, 0x75, 0x35, 0xdb, 0x7b, 0xaa,
			0x69, 0x0d, 0xd8, 0x58, 0x92, 0xb4, 0xb0, 0x7f, 0x3f, 0xa3, 0x2d, 0xa3, 0x65, 0x6f, 0x17, 0x72,
			0xbe, 0x73, 0xee, 0xcd, 0xf1, 0xbc, 0x9d, 0x6c, 0xc5, 0xae, 0xd3, 0x07, 0x6e, 0xc9, 0x77, 0x94,
			0x9c, 0x9f, 0x1e, 0x66, 0x13, 0xcf, 0x4b, 0xd2, 0x15, 0x5b, 0x6c, 0xc8, 0x6b, 0x1a, 0x93, 0x82,
			0x96, 0xa5, 0x1f, 0x0b, 0x53, 0x69, 0x79, 0xb4, 0xb2, 0x53, 0x64, 0x5a, 0x70, 0x63, 0xa4, 0xda,
			0xe3, 0x99, 0x6b, 0xc9, 0x95, 0x9d, 0xbe, 0x39, 0x20, 0xdf, 0xac, 0x29, 0x1b, 0x80, 0x25, 0xf3,
			0xb3, 0xd3, 0x61, 0x2b, 0x34, 0x09, 0x7d, 0xf6, 0x73, 0x14, 0xa4, 0xb4, 0xba, 0x97, 0xdf, 0x7a,
			0x2c, 0x85, 0xea, 0x6c, 0xff, 0x38, 0xc0, 0x69, 0x96, 0xe4, 0x03, 0x4a, 0xa3, 0x2b, 0x4a, 0x47,
			0x34, 0x55, 0x56, 0xec, 0x85, 0xbe, 0x65, 0x69, 0xdb, 0x8a, 0x56, 0x60, 0xd5, 0x9d, 0x94, 0x45,
			0xa9, 0x70, 0x7f, 0xf1, 0x32, 0x3e, 0xf6, 0x87, 0xa0, 0xe0, 0x55, 0x83, 0x74, 0xc5, 0x90, 0x0f,
			0x3a, 0xdf, 0x49, 0x6c, 0x23, 0xd0, 0xf0, 0x83, 0xc0, 0x4e, 0xd7, 0x42, 0x23, 0x37, 0xd8, 0x4a,
			0x63, 0x45, 0x7d, 0x17, 0x9f, 0xdd, 0x6d, 0xfe, 0x6f, 0x3c, 0xeb, 0x2c, 0x6f, 0x51, 0x0d, 0x42,
			0xec, 0x76, 0x97, 0x18, 0xe3, 0x62, 0x2a, 0x37, 0xd7, 0x7f, 0x0b, 0xdd, 0xda, 0xc7, 0xef, 0x57,
			0xfb, 0x60, 0xb4, 0x4f, 0x5a, 0x7e, 0xf7, 0x2d, 0xf5, 0xb6, 0xcc, 0x0a, 0x5c, 0x0b, 0xa7, 0x32,
			0x8d, 0x3c, 0x3a, 0x83, 0xe8, 0x63, 0x93, 0xaf, 0xa1, 0xc8, 0x4b, 0x48, 0x63, 0xd8, 0x2c, 0x12,
			0xe8, 0x6f, 0x83, 0xcf, 0x2f, 0xba, 0x82, 0xb1, 0x25, 0x70, 0x01, 0x30, 0x16, 0x00, 0x19, 0x0d,
			0x67, 0xf3, 0xe7, 0xf9, 0xa4, 0x6a, 0x74, 0x08, 0x61, 0x10, 0x80, 0x36, 0x21, 0x50, 0x60, 0x6e,
			0x7e, 0x08, 0xc0, 0x95, 0x09, 0x34, 0x22, 0xe1, 0x0b, 0xcd, 0xc8, 0x0c, 0x96, 0x0c, 0x82, 0xc7,
			0x70, 0xf2, 0x0b, 0xf2, 0xd2, 0x81, 0xe5, 0x05, 0x02, 0x00, 0x00, 0x1f, 0x8b, 0x08, 0x04, 0x00,
			0x00, 0x00, 0x00, 0x00, 0xff, 0x06, 0x00, 0x42, 0x43, 0x02, 0x00, 0x1b, 0x00, 0x03, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
		]);
	}

	function getIndexArray() {
		return new Uint8Array([
			0x1f, 0x8b, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0x06, 0x00, 0x42, 0x43, 0x02, 0x00,
			0x41, 0x00, 0x0b, 0x71, 0xf2, 0x64, 0x64, 0x64, 0x60, 0x60, 0x60, 0x02, 0x62, 0x18, 0x0d, 0x02,
			0xca, 0x50, 0x9a, 0x15, 0x88, 0x93, 0x33, 0x8a, 0x0c, 0xc1, 0x92, 0x9e, 0x42, 0x10, 0x45, 0x37,
			0x18, 0xa1, 0xb2, 0x0c, 0xde, 0x60, 0x16, 0xb2, 0x18, 0x00, 0x82, 0x1c, 0x03, 0xa2, 0x51, 0x00,
			0x00, 0x00, 0x1f, 0x8b, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0x06, 0x00, 0x42, 0x43,
			0x02, 0x00, 0x1b, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00      
		]);
	}

	function arrayToBlob(array) {
		return new Blob([array], {type: 'application/octet-binary'});
	}

	function getTestFile() {
		return new TabixIndexedFile(
				new LocalFileReader(arrayToBlob(getFileArray())),
				new LocalFileReader(arrayToBlob(getIndexArray()))
		);
	}

	it('should load tabix index', function() {
		var indexedFile = getTestFile();
		expect(indexedFile).to.exist;
		return indexedFile._contigs.then(contigs => {
			expect(contigs.size).to.equal(1);
		});
	});

    it('should reject on invalid index file', () => {
        let indexedFile = getTestFile('./test-data/single_sample.vcf.gz', './test-data/single_sample.vcf.gz')
        expect(indexedFile._contigs).to.be.rejected;
    });

	it('should return requested records', function() {
		var indexedFile = getTestFile();
		return indexedFile.records('chr1', 1, 200).then(records => {
			expect(records).to.eql(['chr1\t100\trs1\tA\tT\t100.0\tPASS\tAC=1;AN=2\tGT\t0/1']);
		});
	});

	it('should return zero length array for empty region', function() {
		var indexedFile = getTestFile();
		return indexedFile.records('chr1', 102, 102).then(records => {
			expect(records).to.have.lengthOf(0);
		});
	});

	// TODO: Test filtering on structural variants
    
    it('should return header lines', function() {
        var indexedFile = getTestFile();
        return indexedFile.header().then(header => {
            expect(header.length).to.equal(7);
        });
    });
});
