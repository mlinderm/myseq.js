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

	ids: Array<string>;

  variantInfo;

  _genotypes: Map<string,string>;

	constructor(line: string, samples: Array<string> = []) {
		this._line = line;

		this._fields  = this._line.split('\t', samples.length > 0 ? samples.length + 9 : 8);
		this.contig   = this._fields[0];
		this.position = Number(this._fields[1]);
		this.ids			= this._fields[2].split(';');
		this.ref      = this._fields[3];
    this.alt      = this._fields[4].split(',');

    // Parse genotypes
    this._genotypes = new Map();
    for (let s = 0; s < samples.length; s++) { 
      // GT must be the first field for each sample
      let end_of_GT = this._fields[s+9].indexOf(":");
      let GT = end_of_GT === -1 ? this._fields[s+9] : this._fields[s+9].substring(0, end_of_GT);
      
      // Normalize alleles, while ignoring the distinction bewteen '/' and '|'
      let stringGT = GT
        .split(/[/|]/)
        .map(allele => {
          if (allele == '.')
            return '.';
          else if (allele == '0')
            return this.ref;
          else
            return this.alt[parseInt(allele)-1];
        })
        .join('/');
      this._genotypes.set(samples[s], stringGT);
    }

		this.variantInfo = undefined;
	}

 	myVariantInfo(chr, pos, ref, alt) {
		if (!this.variantInfo) {
			const url = `https://myvariant.info/v1/query?q=chr${chr}%3A${pos}`;
			fetch(url)
				.then(response => response.json())
				.then(data => data.hits
					.map(hit => {if (hit._id === `chr${chr}:g.${pos}${ref}>${alt}`) { this.variantInfo = hit; } })
				);
		}
	}

	toString(): string {
		return `${this.contig}:${this.position}${this.ref}>${this._fields[4]}`
	}

	genotype(sample: string): string {
    return sample == undefined ? this._genotypes.values().next().value : this._genotypes.get(sample);
	}

};

export default VCFVariant;
