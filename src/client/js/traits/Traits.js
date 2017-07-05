/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Link } from 'react-router-dom';

import EarwaxTrait from './EarwaxTrait';
import AsparagusAnosmiaTrait from './AsparagusAnosmiaTrait';
import SprintingTrait from './SprintingTrait';

import VCFSource from '../../../lib/js/io/VCFSource';

class Traits extends React.Component {
  constructor(props) {
    super(props);   
  }

  render() : any {
    const { source, settings } = this.props;
    return (
      <Switch>
        <Route exact path='/traits' component={TraitsOverview} />
        <Route path='/traits/earwax' render={rp => 
          <EarwaxTrait {...rp} source={source} settings={settings} />
        } />
        <Route path='/traits/asparagus_anosmia' render={rp => 
          <AsparagusAnosmiaTrait {...rp} source={source} settings={settings} />
        } />
        <Route path='/traits/sprinting' render={rp => 
          <SprintingTrait {...rp} source={source} settings={settings} />
        } />
      </Switch>
    );
  }
}  

Traits.propTypes = {
  settings: PropTypes.object.isRequired,
	source: PropTypes.instanceOf(VCFSource).isRequired
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
        <Link to='/traits/asparagus_anosmia'>Asparagus Anosmia</Link>
        <Link to='/traits/sprinting'>Sprinting Performance</Link>
      </div>
    );
  }
}

TraitsOverview.propTypes = {
};

export {
  Traits  
};
