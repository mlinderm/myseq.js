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
import RiskTable from './RiskTable';

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

var exampleRisk = [
  {'AC': '2', 'OR': '2.17', 'chr': 'chr7', 'LR': '1.991', 'genotype': 'C/C', 'AF': '0.178', 'alt': 'C', 'ref': 'T', 'pos': '141672604', 'id': 'rs10246939'},
  {'AC': '1', 'OR': '1.18', 'chr': 'chr7', 'LR': '1.083', 'genotype': 'T/C', 'AF': '0.178', 'alt': 'C', 'ref': 'T', 'pos': '141672604', 'id': 'rs10246939'},
  {'AC': '0', 'OR': '1', 'chr': 'chr7', 'LR': '0.918', 'genotype': 'T/T', 'AF': '0.178', 'alt': 'C', 'ref': 'T', 'pos': '141672604', 'id': 'rs10246939'}
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
			return (<div style={{"margin":30, "padding":30}}>
								<VariantQuery source={this.state.source} />
								----------------------------------
								<MultiTraitTable source={this.state.source} traits={example} />
                <p>Yellow means genotype is present.</p>
                ----------------------------------
                <RiskTable source={this.state.source} disease={exampleRisk} />
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
