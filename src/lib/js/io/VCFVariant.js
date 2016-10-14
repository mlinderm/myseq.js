/**
 * @flow
 */

'use strict';

class VCFVariant {
	
	_line: string;
	_coreFields: Array<string>;


	contig: string;
	position: number;
	ref: string


	constructor(line: string) {
		this._line = line;
		
		this._coreFields = this._line.split("\t",8);
		this.contig   = this._coreFields[0];
		this.position = Number(this._coreFields[1]);
		this.ref      = this._coreFields[3];
	}

	toString() {
		return `${this.contig}:${this.position}${this.ref}>${this._coreFields[4]}`
	}

};

module.exports = VCFVariant;
