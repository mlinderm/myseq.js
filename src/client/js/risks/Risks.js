/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Link } from 'react-router-dom';

import VCFSource from '../../../lib/js/io/VCFSource';
import Type2DiabetesRisk from './Type2DiabetesRisk';


class Risks extends React.Component {
  constructor(props) {
    super(props);   
  }

  render() : any {
    return (
      <Switch>
        <Route exact path='/risks' render={rp => <RisksOverview {...rp} source={this.props.source} />} />
        <Route path='/risks/t2d' render={rp => <Type2DiabetesRisk {...rp} source={this.props.source} />} />
      </Switch>
    );
  }
}  

Risks.propTypes = {
	source: PropTypes.instanceOf(VCFSource)
};


class RisksOverview extends React.Component {
  constructor(props) {
    super(props);   
  }

  render(): any {
    return (
      <div>
        <p>A description of common polygenic disease risk in the genome:</p>
        <Link to='/risks/t2d'>Type 2 Diabetes</Link>
      </div>
    );
  }
}

RisksOverview.propTypes = {
	source: PropTypes.instanceOf(VCFSource)
};

export {
  Risks  
};
