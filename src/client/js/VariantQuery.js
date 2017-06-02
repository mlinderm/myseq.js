/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import VCFSource from '../../lib/js/io/VCFSource';
import VariantTable from './VariantTable';

class CoordinateSearchBox extends React.Component {
    constructor(props) {
        super();

        this.state = { searchRegion: '' };

        this.handleSearchRegionChange = this.handleSearchRegionChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSearchRegionChange(e) {
        this.setState({ searchRegion: e.target.value });    
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.handleCoordinateQuery(this.state.searchRegion);
    }

    render() {
        return(
            <form onSubmit={this.handleSubmit}>
                <input type="text" placeholder="Genomic coordinates" value={this.state.searchRegion} onChange={this.handleSearchRegionChange}/>
                <button>Query</button>
            </form>
        );
    }
}

CoordinateSearchBox.propTypes = {
    handleCoordinateQuery: PropTypes.func
};

class VariantQuery extends React.Component {
	constructor(props) {
		super(props);
        this.state = {
            region: '',
			variants: []
        };

        this.handleCoordinateQuery = this.handleCoordinateQuery.bind(this);
	}

    handleCoordinateQuery(searchRegion) {
        this.setState({ region: searchRegion });
        
        var coords = searchRegion.split(/[:-]/, 3);
        this.props.source.variants(coords[0], coords[1], coords[2]).then(variants => {
			this.setState({ variants : variants });	
		});
    }

	componentDidMount() {}

	render() {
        return (
            <div>
                <CoordinateSearchBox searchRegion={this.state.region} handleCoordinateQuery={this.handleCoordinateQuery} />
                <div>
				    <p>Listing variants in {this.state.region}</p>
                    <VariantTable variants={this.state.variants} />	
                </div>
            </div>
		);
	}
}

VariantQuery.propTypes = {
	source: PropTypes.instanceOf(VCFSource)
};

export default VariantQuery;
