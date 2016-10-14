/**
 * @flow
 */
'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import VCFVariantSource from '../../lib/js/io/VCFSource';

class App extends React.Component {
	constructor(props: Object) {
		super(props);
	}

	render(): any {
		return (<p>Show some variants</p>);
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
