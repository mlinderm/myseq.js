/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import SingleVariantTrait from './SingleVariantTrait';
import VCFSource from '../../../lib/js/io/VCFSource';

const sprinting = {
  title: "Sprinting Performance", 
  variant: { chr: 11, pos: 66328095, ref: "T", alt: "C"},
  association: [
    { genotype: "C/C", phenotype: "Likely a sprinter" },
    { genotype: "T/C", phenotype: "Likely a sprinter" },
    { genotype: "T/T", phenotype: "Likely an endurance athlete" }
  ]
};

class SprintingTrait extends React.Component {
  constructor(props){
    super(props);
  }
  
  render() {
    return (
      <SingleVariantTrait source={this.props.source} trait={sprinting}>
        <p>TODO: Background on this particular phenotype</p>
      </SingleVariantTrait>
    );
  }
}

SprintingTrait.propTypes = {
	source: PropTypes.instanceOf(VCFSource),
};

export default SprintingTrait;
