/**
 * @flow
 */

'use strict';

class VCFVariant {

	_line: string;
	_fields: Array<string>;


	contig: string;
	position: number;
	ref: string;
  alt: Array<string>;

	id: string;
	gt: string; //needs conversion

	variantInfo: {};



	constructor(line: string, numFields: number = 8) {
		this._line = line; //instance variable

		this._fields  = this._line.split('\t', numFields);
		this.contig   = this._fields[0];
		this.position = Number(this._fields[1]);
		this.ref      = this._fields[3];
    this.alt      = this._fields[4].split(',');

		this.ids			= this._fields[2].split(';');

		this.zyg			= this._fields[9].split('/');
		this.gt 			= this.genotype();
		this.variantInfo = null;
	}

 	myVariantInfo(chr, pos, ref, alt) {
		if (this.variantInfo == null) {
			const url = `https://myvariant.info/v1/query?q=chr${chr}%3A${pos}`;
			fetch(url).then(response => response.json()).then(data => data.hits.map(hit => {if (hit._id === `chr${chr}:g.${pos}${ref}>${alt}`) {this.variantInfo=hit} }));
		}
	}

	toString() {
		return `${this.contig}:${this.position}${this.ref}>${this._fields[4]}`
	}

	genotype(sample: string) {
		if (this.zyg[0] === "0") {
			var g1 = this.ref;
		} else {
			var g1 = this.alt;
		}

		if (this.zyg[1] === "1") {
			var g2 = this.alt;
		} else {
			var g2 = this.ref;
		}
		return (g1 + "/" + g2)
	}

};

module.exports = VCFVariant;
