/**
 * @flow
 */
'use strict';

import React from 'react';

import VCFSource from '../../lib/js/io/VCFSource';

class VariantQuery extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			variants: []
		};
	}

	componentDidMount() {
		this.props.source.variants('chr1', 1, 200).then(variants => {
			this.setState({ variants : variants });	
			console.log(variants);
		});
	}

	render() {
		return (
			<div>
				<p>Listing variants in chr1:1-200</p>
				<ul>
					{this.state.variants.map(variant => (
						<li key={variant.toString()}>{variant.toString()}</li>
					))}
				</ul>
			</div>
		);
	}
}

VariantQuery.propTypes = {
	source: React.PropTypes.instanceOf(VCFSource)
};

export default VariantQuery;
