/**
 * @flow
 */

'use strict';

class VCFVariant {
	_line: string;

  isSynth: boolean;       

	contig: string;
	position: number;
	ref: string;
  alt: Array<string>;

	ids: Array<string>;

  variantInfo;

  _genotypes: Map<string,string>;

	constructor(line: string, samples: Array<string> = [], isSynth = false) {
		this._line = line;
    this.isSynth = isSynth;

		const fields  = this._line.split('\t', samples.length > 0 ? samples.length + 9 : 8);
		this.contig   = fields[0];
		this.position = Number(fields[1]);
		this.ids			= fields[2].split(';');
		this.ref      = fields[3];
    this.alt      = fields[4].split(',');

    // Parse genotypes
    this._genotypes = new Map();
    for (let s = 0; s < samples.length; s++) { 
      // GT must be the first field for each sample
      let end_of_GT = fields[s+9].indexOf(":");
      let GT = end_of_GT === -1 ? fields[s+9] : fields[s+9].substring(0, end_of_GT);
      
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
		return `${this.contig}:${this.position}${this.ref}>${this.alt.join(',')}`
	}

	genotype(sample: string): string {
    return sample == undefined ? this._genotypes.values().next().value : this._genotypes.get(sample);
	}

}

module.exports = VCFVariant;
