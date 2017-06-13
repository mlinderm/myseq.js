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
import MultiTraitTable from './TraitTable';

var example = [{
  name: "Earwax",
  variant: { chr: 16, pos: 48258198, ref: "C", alt: "T"},
  association: [
    ["C/C", "Wet earwax"],
    ["C/T", "Wet earwax, better BO"],
    ["T/T", "Dry earwax"]
  ]
},
{
  name: "Asparagus Anosmia",
  variant: { chr: 1, pos: 248496863, ref: "T", alt: "C"},
  association: [
    ["A/A", "Pee smells like asparagus"]
  ]
}
];


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
								<MultiTraitTable source={this.state.source} traits={example} />
                <p>Yellow means genotype is present.</p>
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
