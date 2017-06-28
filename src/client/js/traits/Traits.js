/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Link } from 'react-router-dom';

import EarwaxTrait from './EarwaxTrait';

import VCFSource from '../../../lib/js/io/VCFSource';

class Traits extends React.Component {
  constructor(props) {
    super(props);   
  }

  render() : any {
    return (
      <Switch>
        <Route exact path='/traits' render={rp => <TraitsOverview {...rp} source={this.props.source} />} />
        <Route path='/traits/earwax' render={rp => <EarwaxTrait {...rp} source={this.props.source} />} />
      </Switch>
    );
  }
}  

Traits.propTypes = {
	source: PropTypes.instanceOf(VCFSource)
};


class TraitsOverview extends React.Component {
  constructor(props) {
    super(props);   
  }

  render(): any {
    return (
      <div>
        <p>A description of traits in the genome:</p>
        <Link to='/traits/earwax'>Earwax</Link>
      </div>
    );
  }
}

TraitsOverview.propTypes = {
	source: PropTypes.instanceOf(VCFSource)
};

export {
  Traits  
};
