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
    return (
      <SingleVariantTrait source={this.props.source} trait={earwax}>
        <p>TODO: Background on this particular phenotype</p>
      </SingleVariantTrait>
    );
  }
}

EarwaxTrait.propTypes = {
	source: PropTypes.instanceOf(VCFSource),
};

export default EarwaxTrait;
