/**
 * @flow
 */
'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import { Grid, Navbar, Nav, NavItem, NavDropdown, MenuItem, Form, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import VCFSource from '../../lib/js/io/VCFSource';

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
    if (this.state.source) {
      const { source, settings } = this.state;
      return (
        <BrowserRouter>
          <div>
            {/* This should be a nav that is always visible */}
            <Navigation source={this.state.source} settings={settings} updateSettings={this.updateSettings} />
            <Grid>
              <Switch>
                <Route path='/' exact render={rp => <VariantQuery {...rp} source={source} />} />
                <Route path='/settings' exact render={rp => 
                  <Settings {...rp} settings={settings} updateSettings={this.updateSettings} />
                } />
                <Route path='/query' exact render={rp => <VariantQuery {...rp} source={source} />} />
                <Route path='/traits' render={rp => 
                  <Traits {...rp} source={source} settings={settings} />
                } />
                <Route path='/risks' render={rp => 
                  <Risks {...rp} source={source} settings={settings} />
                } />
              </Switch>
            </Grid>
          </div>
        </BrowserRouter>
      );
    } else {
      // Load VCF file if not already provided
      return(<LoadVCFFile updateSource={ this.updateSource } />);
    }
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
