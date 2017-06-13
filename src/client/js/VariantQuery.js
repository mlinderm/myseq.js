/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import VCFSource from '../../lib/js/io/VCFSource';
import VariantTable from './VariantTable';

import { Grid, Row, Col, Form, FormGroup, FormControl, ControlLabel, Button, HelpBlock } from 'react-bootstrap';

class CoordinateSearchBox extends React.Component {
    constructor(props) {
        super();

        this.state = { searchRegion: '' };

        this.handleSearchRegionChange = this.handleSearchRegionChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSearchRegionChange(e) {
        this.setState({ searchRegion: e.target.value });
        //console.log("Search Region: " + this.state.searchRegion);
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.handleCoordinateQuery(this.state.searchRegion);
    }

    render() {
        return(
            <form onSubmit={this.handleSubmit}>
              <FormGroup controlId="formBasicText">
                <ControlLabel>Search for variants with genomic coordinates.</ControlLabel>
                <br />
                <Col sm={8}>
                  <FormControl type="text" placeholder="Genomic coordinates" value={this.state.searchRegion} onChange={this.handleSearchRegionChange}/>
                  <HelpBlock>e.g. chr1:1-200</HelpBlock>
                </Col>
                <Col sm={2}>
                  <Button type="submit">Query</Button>
                </Col>
              </FormGroup>
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

        //console.log("Search Query: " + this.state.region);
        //console.log("Search Query 2: " + searchRegion);

        var coords = searchRegion.split(/[:-]/, 3);

        this.props.source.variants(coords[0], coords[1], coords[2]).then(
          variants => {this.setState({ variants : variants });},
          variants => {this.setState({ variants : [] });});
        //console.log("variants: " + this.state.variants);
    }

	componentDidMount() {
    // this.props.source.variants("chr16", 48258198, 48258198).then(
    //   variants => {console.log(variants)})
  }

	render() {
    if (this.state.region === "") {
      var placeholder = "No Entry";
    } else {
      placeholder = this.state.region;
    }

        return (
            <div>
                <CoordinateSearchBox searchRegion={this.state.region} handleCoordinateQuery={this.handleCoordinateQuery} />
                {/*when autofilled the color matches the genotype match color of the phenotype table*/}
                <br/>
                <br/>
				        <h3>Listing variants in: {placeholder}</h3>
                <VariantTable variants={this.state.variants} />
            </div>
		);
	}
}

VariantQuery.propTypes = {
	source: PropTypes.instanceOf(VCFSource)
};

export default VariantQuery;
