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
    const { settings, source } = this.props;
    return (
      <SingleVariantTrait settings={settings} source={source} trait={sprinting}>
        <p>TODO: Background on this particular phenotype</p>
      </SingleVariantTrait>
    );
  }
}

SprintingTrait.propTypes = {
  settings: PropTypes.object.isRequired,
	source: PropTypes.instanceOf(VCFSource).isRequired
};

export default SprintingTrait;
