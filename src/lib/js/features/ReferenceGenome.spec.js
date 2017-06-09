'use strict';

import {expect} from 'chai';

import * as Ref from './ReferenceGenome';

describe('ReferenceGenome', function() {
    it('should normalize contig names', function() {
        expect(Ref.hg19Reference.normalizeContig("chr1")).to.equal("chr1");
        expect(Ref.hg19Reference.normalizeContig("1")).to.equal("chr1");
        expect(() => { Ref.hg19Reference.normalizeContig("junk"); }).to.throw();
    });

    it('should map reference files to reference genomes', () => {
        expect(Ref.referenceFromFile("human_g1k_v37.fasta")).to.equal(Ref.b37Reference);
        expect(Ref.referenceFromFile("file:/humgen/gsa-hpprojects/GATK/bundle/5974/b37/human_g1k_v37.fasta")).to.equal(Ref.b37Reference);
    });
});
