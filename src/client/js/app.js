/**
 * @flow
 */
'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import VCFSource from '../../lib/js/io/VCFSource';

import LoadVCFFile from './LoadVCFFile';
import VariantQuery from './VariantQuery';
import PhenotypeTable from './Phenotype';

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			source: null
		};
	}

	componentDidMount() {
		// TODO: Initialize source if included in the URL
	}

	render(): any {
		if (this.state.source) {
			return (<VariantQuery source={this.state.source} />);
		} else {
			return (<div>
							<LoadVCFFile updateSource={ this.updateSource.bind(this) } />
							<PhenotypeTable />
							</div>);
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

module.exports = myseq;
if (typeof window !== 'undefined') {
  window.myseq = myseq;
}
