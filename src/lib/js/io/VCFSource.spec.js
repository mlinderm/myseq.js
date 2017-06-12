'use strict';

import {expect} from 'chai';

import {LocalFileReader} from './FileReaders';
import TabixIndexedFile from './TabixIndexedFile';
import VCFSource from './VCFSource';

describe('VCFSource', function() {
    function getTestSource() {
        var vcfPath = './test-data/single_sample.vcf.gz';
        var idxPath = vcfPath + '.tbi';
        return new VCFSource(new TabixIndexedFile(new LocalFileReader(vcfPath), new LocalFileReader(idxPath)));
    }

    it('should load tabix VCF', function() {
        var source = getTestSource();
        expect(source).to.exist;
    });

    // TODO: Test sites-only VCF

    it('should extract the samples from the header', function() {
        var source = getTestSource();
        return source._samples.then(samples => {
            expect(samples).to.deep.equal(['NA12878'])
        });
    });

    it('should return requested variants', function() {
        var source = getTestSource();
        return source.variants('chr1', 1, 200).then(variants => {
            expect(variants).to.have.lengthOf(1);

            var variant = variants[0];
            expect(variant._line).to.equal('chr1\t100\trs1\tA\tT\t100.0\tPASS\tAC=1;AN=2\tGT\t0/1');
            expect(variant._fields.length).to.equal(10);

            expect(variant.toString()).to.equal("chr1:100A>T");

            expect(variant.contig).to.equal("chr1");
            expect(variant.position).to.equal(100);
            expect(variant.ref).to.equal("A");
            expect(variant.alt).to.deep.equal(["T"]);
        });
    });

    it('should return zero length array for empty region', function() {
        var source = getTestSource();
        return source.variants('chr1', 102, 102).then(variants => {
            expect(variants).to.have.lengthOf(0);
        });
    });

    it ('should return variants with matching alleles', function() {
      var source = getTestSource();
      return source.variantByVariant('chr1',100,"A","T").then(variants => {
        expect(variants).to.have.lengthOf(1);
      })
    });

    it ('should filter variants with mismatching alleles', function() {
      var source = getTestSource();
      return source.variantByVariant('chr1',100,"A","G").then(variants => {
        expect(variants).to.have.lengthOf(0);
      })
    });
});
