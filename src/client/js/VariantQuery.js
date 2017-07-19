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
    super(props);

    this.state = {
      searchRegion: '',
    };

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
      <Form horizontal onSubmit={this.handleSubmit}>
        <FormGroup validationState={this.props.validation}>
          <Col sm={4}>
            <FormControl type="text" placeholder="Genomic coordinates" value={this.state.searchRegion} onChange={this.handleSearchRegionChange} />
            <HelpBlock>{this.props.helpMessage}</HelpBlock>
          </Col>
          <Col sm={2}>
            <Button type="submit">Query</Button>
          </Col>
        </FormGroup>
      </Form>
    );
  }
}

CoordinateSearchBox.propTypes = {
  handleCoordinateQuery: PropTypes.func.isRequired
};

class VariantQuery extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      region: undefined,
      validation: null,
      helpMessage: 'Query by genomic coordinates, e.g. chr1:1-100, chr7:141672604-141672604',
      variants: []
    };

    this.handleCoordinateQuery = this.handleCoordinateQuery.bind(this);
  }

  handleCoordinateQuery(searchRegion) {
    //advanced query functionality
    console.log(searchRegion);
    if (searchRegion.slice(0,2) === "rs") {
      const url = `https://myvariant.info/v1/query?q=${searchRegion}`;

      fetch(url)
				.then(response => response.json())
				.then(data => data.hits
          .forEach(hit => {
            let result = hit._id.split(/["g." "A" "C" "T" "G"]/);
            let query = `${result[0]}${result[2]}-${result[2]}`;

            this.handleCoordinateQuery(query);
          })
        );
    } else if (searchRegion[0] === searchRegion[0].toUpperCase() && searchRegion.indexOf(":") === -1) {//no : and uppercase start imagine it is gene name
        const url = `http://mygene.info/v3/query?q=${searchRegion}`;
        console.log(url);
        console.log("test");
        fetch(url)
          .then(response => response.json())
          .then(data => data.hits
            .forEach(hit => {
              let entrezID = hit.entrezgene;
              let url2 = `http://mygene.info/v3/gene/${entrezID}`;
              console.log(url2);

              let minStart = Infinity;
              let maxEnd = -1;
              let chr = undefined;

              fetch(url2)
                .then(response => response.json())
                .then(data => data.exons_hg19
                  .forEach(hit => {
                    if (hit.cdsstart < minStart) {
                      minStart = hit.cdsstart;
                    }

                    if (hit.cdsend > maxEnd) {
                      maxEnd = hit.cdsend;
                    }

                    chr = hit.chr;

                    console.log(minStart);
                    console.log(maxEnd);
                    console.log(chr);
                  }))
            })
          );

      //look up with my gene info, then look up number, then find range for hg19 start and end
    } else { //regular query
      this.setState({ region: searchRegion });

      var coords = searchRegion.split(/[:-]/, 3);

      this.props.source.variants(coords[0], coords[1], coords[2]).then(
        variants => {
          this.setState({
            variants : variants,
            validation: null,
            helpMessage: 'Query by genomic coordinates, e.g. chr1:1-100, chr7:141672604-141672604'});
        },
        err => {
          this.setState({
            validation: 'error',
            helpMessage: err.message,
            variants: []
          });
        }
      );
    }
  }

  render() {
    return (
      <div>
        <CoordinateSearchBox handleCoordinateQuery={this.handleCoordinateQuery} validation={this.state.validation} helpMessage={this.state.helpMessage} />
        {this.state.region &&
          <Row>
            <Col sm={6}>
              <p>Listing {this.state.variants.length} variants in {this.state.region}</p>
              <VariantTable variants={this.state.variants} />
            </Col>
          </Row>
        }
      </div>
    );
  }
}

VariantQuery.propTypes = {
  source: PropTypes.instanceOf(VCFSource)
};

export default VariantQuery;
