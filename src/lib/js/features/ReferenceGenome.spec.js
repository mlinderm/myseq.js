'use strict';

import {expect} from 'chai';

import {ReferenceGenome, hg19Reference} from './ReferenceGenome';

describe('ReferenceGenome', function() {
    it('should normalize contig names', function() {
        expect(hg19Reference.normalizeContig("chr1")).to.equal("chr1");
        expect(hg19Reference.normalizeContig("1")).to.equal("chr1");
        expect(() => { hg19Reference.normalizeContig("junk"); }).to.throw();
    });

});
