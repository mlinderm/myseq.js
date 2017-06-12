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
import SingleTraitTable from './SingleTraitTable';

var example = {
  variant: { chr: 16, pos: 48258198, ref: "C", alt: "T"},
  association: [
    ["C/C", "Wet earwax"],
    ["C/T", "Wet earwax, better BO"],
    ["T/T", "Dry earwax"]
  ],
};

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
			return (<div>
								<VariantQuery source={this.state.source} />
								----------------------------------
								{/*<PhenotypeTable source={this.state.source}/>*/}
								----------------------------------
								<SingleTraitTable source={this.state.source} trait={example}/>
							</div>);
		} else {
			return (<div>
								<LoadVCFFile updateSource={ this.updateSource.bind(this) } />
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
