/**
 * @flow
 */
'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Link, Redirect } from 'react-router-dom';
import { Grid, Navbar, Nav, NavItem, NavDropdown, MenuItem, Form, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import VCFSource from '../../lib/js/io/VCFSource';

import SourceRoute from './SourceRoute';
import LoadVCFFile from './LoadVCFFile';
import Navigation from './Navigation';
import VariantQuery from './VariantQuery';
import { Traits } from './traits/Traits';
import { Risks } from './risks/Risks';
import Settings from './Settings';

const defaultSettings = {
  sample: undefined,
  assumeRefRef: false
};

class App extends React.Component {

	constructor(settings = {}) {
		super();
		
    this.state = {
			source: undefined,
      settings: Object.assign({}, defaultSettings, settings)
		};
    
    this.updateSource = this.updateSource.bind(this);
    this.updateSettings = this.updateSettings.bind(this);
	}

  updateSource(source: VCFSource) {
		this.setState({ source: source });
	}

  updateSettings(settings) {
    this.setState({ settings: Object.assign({}, this.state.settings, settings) }); 
  }


	componentDidMount() {
		// TODO: Initialize source if included in the URL
	}

	render(): any {
    const { source, settings } = this.state;
    
    return (
      <BrowserRouter>
        <div>
          {/* This should be a nav that is always visible */}
          <Navigation source={source} settings={settings} updateSettings={this.updateSettings} />
          <Grid>
            <Switch>
              <SourceRoute path='/' exact component={VariantQuery} source={source} />
              <Route path='/load' exact render={ rp => 
                <LoadVCFFile {...rp} updateSource={ this.updateSource } />
              } />
              <Route path='/settings' exact render={rp => 
                <Settings {...rp} settings={settings} updateSettings={this.updateSettings} />
              } />
              <SourceRoute path='/query' exact component={VariantQuery} source={source} />
              <SourceRoute path='/traits' component={Traits} source={source} settings={settings} />
              <SourceRoute path='/risks' component={Risks} source={source} settings={settings} />
            </Switch>
          </Grid>
        </div>
      </BrowserRouter>
    );
	}

}


function create(elOrId: string|Element) {
	var el = typeof(elOrId) == 'string' ? document.getElementById(elOrId) : elOrId;
  if (!el) {
    throw new Error(`Attempted to create pileup with non-existent element ${elOrId}`);
  }

	ReactDOM.render(<App />, el);
}

var myseq = {
	create: create
};

export default myseq;
if (typeof window !== 'undefined') {
  window.myseq = myseq;
}
