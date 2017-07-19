'use strict';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
let expect = chai.use(chaiAsPromised).expect;

import {LocalFileReader} from './FileReaders';
import * as Ref from '../features/ReferenceGenome';
import TabixIndexedFile from './TabixIndexedFile';
import VCFSource from './VCFSource';

describe('VCFSource', function() {
    function getTestSourceFull(vcfPath: string, reference: Ref.ReferenceGenome) {
        var idxPath = vcfPath + '.tbi';
        return new VCFSource(new TabixIndexedFile(new LocalFileReader(vcfPath), new LocalFileReader(idxPath)), reference);
    }

    function getTestSource(vcfPath: string = './test-data/single_sample.vcf.gz') {
        return getTestSourceFull(vcfPath, Ref.hg19Reference);
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
            expect(variant.isSynth).to.be.false;

            expect(variant.toString()).to.equal("chr1:100A>T");

            expect(variant.contig).to.equal("chr1");
            expect(variant.position).to.equal(100);
            expect(variant.ref).to.equal("A");
            expect(variant.alt).to.deep.equal(["T"]);
            expect(variant.genotype("NA12878")).to.equal("A/T");
            
            // We can also get the first genotype
            expect(variant.genotype()).to.equal("A/T");
        });
    });

    it('should return requested variants with alternative contig name', function() {
        var source = getTestSource();
        return source.variants('1', 1, 200).then(variants => {
            expect(variants).to.have.lengthOf(1);
        });
    });


    it('should return zero length array for empty region', function() {
        var source = getTestSource();
        return source.variants('chr1', 102, 102).then(variants => {
            expect(variants).to.have.lengthOf(0);
        });
    });

    it('should return empty query if contig in reference but not index', function() {
      var source = getTestSource(); 
      return source.variants('7', 141672604, 141672604).then(variants => {
        expect(variants).to.have.lengthOf(0);
      });  
    });

    it('should reject if contig not in reference and index', function() {
      var source = getTestSource(); 
      expect(source.variants('junk', 141672604, 141672604)).to.be.rejected;
    });

    it ('should return variant with matching alleles', function() {
      var source = getTestSource();
      return source.variant('chr1',100,"A","T").then(variant => {
        expect(variant).to.not.be.undefined;
      })
    });

    it('should filter variants with mismatching alleles', function() {
      var source = getTestSource();
      return source.variant('chr1',100,"A","G").then(variant => {
        expect(variant).to.be.undefined;
      })
    });
    
    it('should infer reference genome from VCF header', function() {
        var source = getTestSourceFull('./test-data/single_sample_with_reference.vcf.gz', undefined);
        return source._reference.then(ref => {
            expect(ref).to.equal(Ref.b37Reference);
        });
    });
    
    it('should generate REF/REF genotype if requested and variant not found', function() {
      var source = getTestSource();
      return source.variant('chr1',100,"A","G", true).then(variant => {
        expect(variant).to.not.be.undefined;
        expect(variant.isSynth).to.be.true;
        expect(variant.toString()).to.equal("chr1:100A>G");
        expect(variant.genotype("NA12878")).to.equal("A/A");
      });
    });
   
    
    it('should return undefined in variant not found even if contig not in index', function() {
      var source = getTestSource();
      
      return source.variant('7', 141672604, 'T', 'C').then(variant => {
        expect(variant).to.be.undefined;
      });
    });

    it('should return synthetic variant if contig not in index and ref/ref requested', function() {
      var source = getTestSource();
      
      return source.variant('7', 141672604, 'T', 'C', true).then(variant => {
        expect(variant).to.not.be.undefined;
        expect(variant.isSynth).to.be.true;
        expect(variant.toString()).to.equal("chr7:141672604T>C");
      });
    });


});
