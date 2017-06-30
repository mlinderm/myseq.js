/**
 * @flow
 */
'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';

import VCFSource from '../../lib/js/io/VCFSource';

import LoadVCFFile from './LoadVCFFile';
import VariantQuery from './VariantQuery';
import { Traits } from './traits/Traits';
import { Risks } from './risks/Risks';

class App extends React.Component {

	constructor() {
		super();
		this.state = {
			source: undefined
		};
	}

	componentDidMount() {
		// TODO: Initialize source if included in the URL
	}

	render(): any {
    if (this.state.source) {
      return (
        <BrowserRouter>
          <div>
            {/* This should be a nav that is always visible */}
            <ul>
              <li><Link to='/query'>Query Variants</Link></li>
              <li><Link to='/traits'>Physical Traits</Link></li>
              <li><Link to='/risks'>Common Disease Risk</Link></li>
            </ul>

            <Switch>
              <Route path='/' exact render={rp => <VariantQuery {...rp} source={this.state.source} />} />
              <Route path='/query' exact render={rp => <VariantQuery {...rp} source={this.state.source} />} />
              <Route path='/traits' render={rp => <Traits {...rp} source={this.state.source} />} />
              <Route path='/risks' render={rp => <Risks {...rp} source={this.state.source} />} />
            </Switch>
          </div>
        </BrowserRouter>
      );
    } else {
      // Load VCF file if not already provided
      return(<LoadVCFFile updateSource={ this.updateSource.bind(this) } />);
    }
	}

	updateSource(source: VCFSource) {
		this.setState({ source: source });
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
