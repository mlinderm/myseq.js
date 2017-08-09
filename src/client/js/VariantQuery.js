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
            <FormControl
              type="text"
              placeholder="Genomic coordinates"
              value={this.state.searchRegion}
              onChange={this.handleSearchRegionChange}
            />
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
      helpMessage: 'Query by genomic coordinates, e.g. chr1:1-100, chr7:141672604-141672604, chr4:1-100000',
      variants: [],
      referenceGenome: undefined
    };

    this.handleCoordinateQuery = this.handleCoordinateQuery.bind(this);
  }

  searchByRSID(searchRegion, multiple = false) {
    const url = `https://myvariant.info/v1/query?q=${searchRegion}`;

    return( fetch(url)
      .then(response => response.json())
      .then(data => Promise.all(data.hits
        .map(hit => {
          if (this.state.referenceGenome === "hg38") {
            let result = hit.clinvar;
            if (result === undefined) {
              console.log("No translation available.");
            } else {
              let query = `chr${result.chrom}:${result.hg38.start}-${result.hg38.end}`;
              return this.handleCoordinateQuery(query, multiple);
            }
          } else if (this.state.referenceGenome === "hg19" || this.state.referenceGenome === "b37") {
            let result = hit._id.split(/["g." "A" "C" "T" "G"]/);
            let query = `${result[0]}${result[2]}-${result[2]}`;

            return this.handleCoordinateQuery(query, multiple);
          }
        })
      ))
    )
  }

  searchByGeneName(searchRegion, genomeBuild, multiple = false) {
    //look up with my gene info, then look up number, then find range for hg19 start and end
    const url = `http://mygene.info/v3/query?q=${searchRegion}&species=human&size=1`;

    return (fetch(url)
      .then(response => response.json())
      .then(data => Promise.all(data.hits
        .map(hit => {
          //console.log(data.hits);
          let entrezID = hit.entrezgene;
          let url2 = `http://mygene.info/v3/gene/${entrezID}`;

          let minStart = Infinity;
          let maxEnd = -1;
          let chr = undefined;

          return (fetch(url2)
            .then(response => response.json())
            .then(data => Promise.all(data[genomeBuild]
              .map(hit => {
                //console.log(hit);
                if (hit.txstart < minStart) {
                  minStart = hit.txstart;
                }

                if (hit.txend > maxEnd) {
                  maxEnd = hit.txend;
                }

                chr = hit.chr;

                if (data[genomeBuild][data[genomeBuild].length -1] === hit) {
                  let query = `${chr}:${minStart}-${maxEnd}`;
                  if (multiple === false) {
                    return (this.handleCoordinateQuery(query, multiple));
                  } else if (multiple === true) {
                    return (this.handleCoordinateQuery(query, multiple)
                    )
                  }
                }
              }
            )))
        )})
      )))
  }

  handleCoordinateQuery(searchRegion, multiple = false) {
    const scalar = v => !Array.isArray(v);
    const flatten = (deep, flat = []) => {
      if (deep.length == 0) return flat;
      let [head, ...tail] = deep;
      if (scalar(head)) {
        return flatten(tail, flat.concat(head));
      } else {
        return flatten(tail, flat.concat(flatten(head)));
      }
    }
    // advanced query functionality
    const searches = searchRegion.split(",").filter(search => search !== "");
    console.log(searches);
    if (searches.length > 1) {
      let results = searches.map(search => {
        return this.handleCoordinateQuery(search.trim(), true)
      });

      Promise.all(results)
        .then(values => flatten(values).filter(value => value !== undefined))
          .then(result => this.setState({
            variants : result,
            validation: null,
            helpMessage: 'Query by genomic coordinates, e.g. chr1:1-100, chr7:141672604-141672604, chr4:1-100000',
            region: searchRegion})
            ,
            err => {
              this.setState({
                validation: 'error',
                helpMessage: err.message,
                variants: [],
                region: searchRegion
              });
            }
          );

    } else if (searches.length === 1) {

      if (this.state.referenceGenome === "hg19" || this.state.referenceGenome === "b37") {
        var genomeBuild = "exons_hg19";
      } else if (this.state.referenceGenome === "hg38") {
        var genomeBuild = "exons"; //TODO: verify this is the right property name for hg38 searches
      }

      if (searchRegion.slice(0,2) === "rs") { //search by rsid
        return this.searchByRSID(searchRegion, multiple);

      } else if (searchRegion[0] === searchRegion[0].toUpperCase() && searchRegion.indexOf(":") === -1) {//no : and uppercase start imagine it is gene name, make sure human
        return this.searchByGeneName(searchRegion, genomeBuild, multiple);

      } else { //regular query

        var coords = searchRegion.trim().split(/[:-]/, 3);

        if (multiple === false) {
          this.setState({ region: searchRegion });

          this.props.source.variants(coords[0], parseInt(coords[1]), parseInt(coords[2])).then(
            variants => {
              this.setState({
                variants : variants,
                validation: null,
                helpMessage: 'Query by genomic coordinates, e.g. chr1:1-100, chr7:141672604-141672604, chr4:1-100000'});
            },
            err => {
              this.setState({
                validation: 'error',
                helpMessage: err.message,
                variants: []
              });
            }
          );
        } else if (multiple === true) {
          return this.props.source.variants(coords[0], parseInt(coords[1]), parseInt(coords[2]))
        }
      }
    }
  }

  componentDidMount() {
    // Initialize search if included in the URL
    // source=http%3A%2F%2Fwww.cs.middlebury.edu%2F~mlinderman%2Fmyseq%2FNA12878_GIAB_highconf_CG-IllFB-IllGATKHC-Ion-Solid-10X_CHROM1-X_v3.3_highconf.vcf.gz

    //need this to finish
    this.props.source.reference().then(ref => {
      this.setState({ referenceGenome: ref.shortName });

      //before this starts
      const params = new URLSearchParams(this.props.location.search);
      let query = params.get("search");

      if (query !== null) {
        let decodedURL = decodeURIComponent(query);
        this.handleCoordinateQuery(decodedURL);
      }
    });

  }

  render() {
    return (
      <div>
        <CoordinateSearchBox handleCoordinateQuery={this.handleCoordinateQuery} validation={this.state.validation} helpMessage={this.state.helpMessage} />
        {this.state.region &&
          <Row>
            <Col sm={6}>
              <p>Listing {this.state.variants.length} variants in {this.state.region}</p>
              <VariantTable variants={this.state.variants} referenceGenome={this.state.referenceGenome}/>
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
