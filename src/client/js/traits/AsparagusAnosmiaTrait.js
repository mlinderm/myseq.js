/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import SingleVariantTrait from './SingleVariantTrait';
import VCFSource from '../../../lib/js/io/VCFSource';

const asparagus = {
  title: "Asparagus Anosmia", 
  variant: { chr: 1, pos: 248496863, ref: "T", alt: "C" },
  association: [
    { genotype: "T/T", phenotype: "Most likely to smell asparagus metabolites in urine" },
    { genotype: "T/C", phenotype: "More likely to smell asparagus metabolites in urine" },
    { genotype: "C/C", phenotype: "Least likely to smell asparagus metabolites in urine" }
  ]
};

class AsparagusAnosmiaTrait extends React.Component {
  constructor(props){
    super(props);
  }
  
  render() {
    const { settings, source } = this.props;
    return (
      <SingleVariantTrait settings={settings} source={source} trait={asparagus}>
        <p>TODO: Background on this particular phenotype</p>
      </SingleVariantTrait>
    );
  }
}

AsparagusAnosmiaTrait.propTypes = {
  settings: PropTypes.object.isRequired,
	source: PropTypes.instanceOf(VCFSource).isRequired
};

export default AsparagusAnosmiaTrait;
