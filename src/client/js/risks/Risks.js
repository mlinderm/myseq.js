/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Link } from 'react-router-dom';

import VCFSource from '../../../lib/js/io/VCFSource';
import RiskTable from './RiskTable';

let data = [
  {
    fullName: "Type 2 Diabetes",
    pathName: "t2d",
    variants: [
        {
          variant: { chr: '6', pos: 20717255, ref: 'T', alt: 'C', id: 'rs9465871' },
          LR: { 'T/T' : 0.918, 'T/C' : 1.083, 'C/C': 1.991, 'C/T' : 1.083 } //why does changing chr break everything
        },
        {
          variant: { chr: '10', pos: 114756041, ref: 'A', alt: 'T', id: 'rs4506565' },
          LR: { 'T/T' : 1.504, 'A/T' : 1.088, 'A/A': 0.8, 'T/A' : 1.088 }
        },
        {
          variant: { chr: '16', pos: 53820527, ref: 'T', alt: 'A', id: 'rs9939609' },
          LR: { 'A/A' : 1.24, 'T/A' : 1.072, 'T/T': 0.8, 'A/T' : 1.072  }
        },
        {
          variant: { chr: '11', pos: 17409572, ref: 'T', alt: 'C', id: 'rs5219' },
          LR: { 'T/T' : 1.154, 'T/C' : 1.004, 'C/C': 0.873, 'C/T' : 1.004 }
        },
        {
          variant: { chr: '8', pos: 118184783, ref: 'C', alt: 'T', id: 'rs13266634' },
          LR: { 'C/C' : 1.079, 'C/T' : 0.964, 'T/T': 0.861, 'T/C' : 0.964 }
        },
        {
          variant: { chr: '10', pos: 94462882, ref: 'C', alt: 'T', id: 'rs1111875' },
          LR: { 'C/C': 1.118, 'C/T' : 0.989, 'T/T': 0.875, 'T/C' : 0.989 }
        },
        {
          variant: { chr: '6', pos: 20661250, ref: 'G', alt: 'C', id: 'rs7754840' },
          LR: { 'C/C' : 1.166, 'G/C' : 1.041, 'G/G': 0.93, 'C/G' : 1.041 }
        },
        {
          variant: { chr: '3', pos: 185511687, ref: 'G', alt: 'T', id: 'rs4402960' },
          LR: { 'T/T' : 1.2, 'G/T' : 1.053, 'G/G': 0.923, 'T/G' : 1.053 }
        },
        {
          variant: { chr: '9', pos: 22134094, ref: 'T', alt: 'C', id: 'rs10811661' },
          LR: { 'T/T' : 1.059, 'T/C' : 0.883, 'C/C': 0.736, 'C/T' : 0.883 }
        },
        {
          variant: { chr: '10', pos: 114758349, ref: 'C', alt: 'T', id: 'rs7903146' },
          LR: { 'C/T' : 1.225, 'C/C' : 0.625, 'T/T': 1.504, 'T/C' : 1.225 }
        },
        {
          variant: { chr: '3', pos: 12393125, ref: 'C', alt: 'G', id: 'rs1801282' },
          LR: { 'C/C' : 1.037, 'C/G' : 0.843, 'G/G': 0.686, 'G/C' : 0.843 }
        },
        {
          variant: { chr: '4', pos: 6292915, ref: 'A', alt: 'G', id: 'rs10010131' },
          LR: { 'A/A' : 1.134, 'A/G' : 1.013, 'G/G': 0.904, 'G/A' : 1.013 }
        },
        {
          variant: { chr: '6', pos: 151672604, ref: 'A', alt: 'G', id: 'rs20679709' },
          LR: { 'A/A' : 0.904, 'A/G' : 1.085, 'G/G': 1.302, 'G/A' : 1.085 }
        },
        {
          variant: { chr: '11', pos: 92673828, ref: 'C', alt: 'T', id: 'rs1387153' },
          LR: { 'T/T' : 1.13, 'T/C' : 1.037, 'C/C': 0.951, 'C/T' : 1.037 }
        }
    ],
    description: "Background information on Type 2 Diabetes.",
    preRiskValue : 25
  }
]


class Risks extends React.Component {
  constructor(props) {
    super(props);
  }

  render() : any {
    const { settings, source } = this.props;
    return (
      <Switch>
        <Route exact path='/risks' render={rp => <RisksOverview {...rp} source={source} settings={settings} />} />
        {data.map((entry,index) => {
          return (
            <Route key={index} path={`/risks/${entry.pathName}`} render={rp => <RiskTable settings={settings} source={source} riskVariants={entry.variants} preRisk={entry.preRiskValue} description={entry.description}/>} />
          )
        })}
        <Route render= {() => <h1>404: Disease Not Found</h1>}/>
      </Switch>
    );
  }
}

Risks.propTypes = {
  settings: PropTypes.object.isRequired,
	source: PropTypes.instanceOf(VCFSource).isRequired
};


class RisksOverview extends React.Component {
  constructor(props) {
    super(props);
  }

//make into map
  render(): any {
    return (
      <div>
        <p>A description of common polygenic disease risk in the genome:</p>
        {data.map((entry, index) => {
          return (
            <Link key={index} to={`/risks/${entry.pathName}`}>{entry.fullName}</Link>
          )
        })}
      </div>
    );
  }
}

RisksOverview.propTypes = {
};

export default Risks;
