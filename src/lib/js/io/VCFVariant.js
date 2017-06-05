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


	constructor(line: string, numFields: number = 8) {
		this._line = line;

		this._fields  = this._line.split('\t', numFields);
		this.contig   = this._fields[0];
		this.position = Number(this._fields[1]);
		this.ref      = this._fields[3];
        this.alt      = this._fields[4].split(',');

		this.id				= this._fields[2];
	}

	toString() {
		return `${this.contig}:${this.position}${this.ref}>${this._fields[4]}`
	}

	printID() {
		if('.' === this.id){
			return 'None'
		} else{
		return `${this.id}`.split(':')
	}

};

module.exports = VCFVariant;
