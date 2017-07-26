/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import SingleVariantTrait from './SingleVariantTrait';
import VCFSource from '../../../lib/js/io/VCFSource';

const earwax = {
  title: "Earwax Consistency",
  variant: { chr: '16', pos: 48258198, ref: "C", alt: "T"},
  association: [
    { genotype: "C/C", phenotype: "Wet earwax" },
    { genotype: "C/T", phenotype: "Wet earwax" },
    { genotype: "T/T", phenotype: "Dry earwax" }
  ]
};


class EarwaxTrait extends React.Component {
  constructor(props){
    super(props);
  }
  
  render() {
    const { settings, source } = this.props;
    return (
      <SingleVariantTrait settings={settings} source={source} trait={earwax}>
        <p>This <abbr title="Single Nucleotide Polymorphism">SNP</abbr> in the <i>ABCC11</i> gene
        determines human earwax consistency. The TT genotype
        is associated with a "dry earwax", while CC and CT are associated with
        wet earwax. This SNP is also a proxy for East Asian ancestry; the T
        allele is more common in East Asian populations. [<a target="_blank"
        href="https://www.ncbi.nlm.nih.gov/pubmed/16444273">PMID
        16444273</a>]</p>
      </SingleVariantTrait>
    );
  }
}

EarwaxTrait.propTypes = {
  settings: PropTypes.object.isRequired,
	source: PropTypes.instanceOf(VCFSource).isRequired
};

export default EarwaxTrait;
