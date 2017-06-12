'use strict';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
let expect = chai.use(chaiAsPromised).expect

import {LocalFileReader} from './FileReaders';
import TabixIndexedFile from './TabixIndexedFile';

describe('TabixIndexedFile', function() {
	function getTestFile(
        vcfPath: string = './test-data/single_sample.vcf.gz', 
        idxPath: string = vcfPath + '.tbi'
    ) {
		return new TabixIndexedFile(new LocalFileReader(vcfPath), new LocalFileReader(idxPath));
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
			expect(records).to.deep.equal(['chr1\t100\trs1\tA\tT\t100.0\tPASS\tAC=1;AN=2\tGT\t0/1']);
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
