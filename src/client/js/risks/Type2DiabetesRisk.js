/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import RiskTable from './RiskTable';
import VCFSource from '../../../lib/js/io/VCFSource';

const t2d = [
  { 
    variant: { chr: '7', pos: 141672604, ref: 'T', alt: 'C', id: 'rs10246939' },
    LR: { 'T/T' : 0.918, 'T/C' : 1.083, 'C/C': 1.991 }
  }
];

class Type2DiabetesRisk extends React.Component {
  constructor(props){
    super(props);
  }
  
  render() {
    const { settings, source } = this.props;
    return (
      <RiskTable settings={settings} source={source} riskVariants={t2d}>
        <p>TODO: Background on this particular phenotype</p>
      </RiskTable>
    );
  }
}

Type2DiabetesRisk.propTypes = {
  settings: PropTypes.object.isRequired,
	source: PropTypes.instanceOf(VCFSource).isRequired
};

export default Type2DiabetesRisk;
