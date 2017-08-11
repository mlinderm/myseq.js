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
      original: undefined,
      validation: null,
      helpMessage: 'Query by genomic coordinates, e.g. chr1:1-100, chr7:141672604-141672604, chr4:1-100000',
      variants: [],
      referenceGenome: undefined
    };

    this.handleCoordinateQuery = this.handleCoordinateQuery.bind(this);
  }

  translateRSID(searchRegion) {
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

            return query;
          }
        })
      ))
    )
  }

  translateGeneName(searchRegion, genomeBuild) {
    //look up with my gene info, then look up number, then find range for hg19 start and end
    const url = `http://mygene.info/v3/query?q=${searchRegion}&species=human&size=1`;

    return (fetch(url)
      .then(response => response.json())
      .then(data => Promise.all(data.hits
        .map(hit => {
          let entrezID = hit.entrezgene;
          let url2 = `http://mygene.info/v3/gene/${entrezID}`;

          let minStart = Infinity;
          let maxEnd = -1;
          let chr = undefined;

          return (fetch(url2)
            .then(response => response.json())
            .then(data => Promise.all(data[genomeBuild]
              .map(hit => {
                if (hit.txstart < minStart) {
                  minStart = hit.txstart;
                }

                if (hit.txend > maxEnd) {
                  maxEnd = hit.txend;
                }

                chr = hit.chr;

                if (data[genomeBuild][data[genomeBuild].length -1] === hit) {
                  let query = `${chr}:${minStart}-${maxEnd}`;
                  return query;
                }
              }
            )))
        )})
      )))
  }

  translateSearch(searchRegion, genomeBuild) {
    if (searchRegion.slice(0,2) === "rs") {
      return this.translateRSID(searchRegion);
    } else if (searchRegion[0] === searchRegion[0].toUpperCase() && searchRegion.indexOf(":") === -1) {
      return this.translateGeneName(searchRegion, genomeBuild);
    } else {
      return searchRegion;
    }
  }

  handleCoordinateQuery(searchRegion, multiple = false, translationBoolean = false) {
    this.setState({translation: translationBoolean});

    //helper functions
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

    //not needed now that mergeSearches works correctly

    // const sortUniqueVariants = values => {
    //   let uniqueVariant = [];
    //   let uniqueIndices = [];
    //
    //   values.forEach((value, index) => {
    //     if (uniqueVariant.indexOf(value.toString()) === -1) {
    //       uniqueVariant.push(value.toString());
    //       uniqueIndices.push(index);
    //     }
    //   });
    //
    //   return uniqueIndices;
    // }

    const mergeSearches = searches => {
      const coordinates = search => search.trim().split(/[:-]/, 3);

      let coordSearches = searches
      .map(search => coordinates(search))
      .map(search => { //for single position searches
        if(search.length === 2) {
          search.push(search[1])
        }
        return search
      })

      let chrList = {};
      coordSearches.forEach(search => {
        let chr = (search[0].slice(0,3) === "chr") ? search[0].slice(3) : search[0];

        if (Object.keys(chrList).indexOf(chr) === -1) {
          chrList[chr] = [search.slice(1).map(num => parseInt(num))];

        } else {
          let temp = chrList[chr];
          temp.push(search.slice(1).map(num => parseInt(num)));
          chrList[chr] = temp;
        }
      })

      const sortHelper = (a, b) => a[0]-b[0] || a[1]-b[1];

      const mergeSorted = (ranges) => {
        var result = [];

        ranges.forEach(function(r) {
          if(!result.length || r[0] > result[result.length-1][1])
              result.push(r);
          else
              result[result.length-1][1] = r[1];
        });

        return result;
      }

      let merged = Object.keys(chrList).map(key => mergeSorted(chrList[key].sort(sortHelper)));

      let queries = [];

      Object.keys(chrList).forEach( (key, index) => {
        merged[index].forEach(array => {
          let query = `chr${key}:${array[0]}-${array[1]}`;

          queries.push(query);
        })
      })

      return queries;
    }

    //search
    if (this.state.referenceGenome === "hg19" || this.state.referenceGenome === "b37") {
      var genomeBuild = "exons_hg19";
    } else if (this.state.referenceGenome === "hg38") {
      var genomeBuild = "exons"; //TODO: verify this is the right property name for hg38 searches
    }

    // advanced query functionality
    const searches = searchRegion.split(",").filter(search => search !== "");

    if (searches.length > 1) {
      let translations = searches.map(search => {
        return this.translateSearch(search.trim(), genomeBuild)
      });

      Promise.all(translations)
        .then(search => flatten(search).filter(search => search !== undefined),
        err => {
          this.setState({
            validation: 'error',
            helpMessage: err.message,
            variants: [],
            region: searchRegion
          });
        })
          .then(results => {
            let searchRegionDisplay = mergeSearches(results).join(", ");

            this.setState({
              translation: true,
              original: searchRegion,
              region: searchRegionDisplay
            }); //can be original search with searchRegion or merged positional search with searchRegionDisplay

            return Promise.all(mergeSearches(results).map(result => this.handleCoordinateQuery(result, true, true)))
          })
            .then(result => flatten(result))
              .then(result => this.setState({
                variants : result,
                validation: null,
                helpMessage: 'Query by genomic coordinates, e.g. chr1:1-100, chr7:141672604-141672604, chr4:1-100000'
              })
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

      if (searchRegion.slice(0,2) === "rs") { //search by rsid
        this.setState({original: searchRegion});
        let query = this.translateRSID(searchRegion);

        query.then(search => flatten(search).filter(search => search !== undefined))
          .then(query => {

            if (query.length === 0) {
              console.log("yippy")
              this.setState({
                validation: 'error',
                helpMessage: 'Invalid rsID.',
                variants: [],
                region: searchRegion
              })
            } else {
              return this.handleCoordinateQuery(query[0], multiple, true)
            }
          });

      } else if (searchRegion[0] === searchRegion[0].toUpperCase() && searchRegion.indexOf(":") === -1) {//no : and uppercase start imagine it is gene name, make sure human
        this.setState({original: searchRegion});

        let query = this.translateGeneName(searchRegion, genomeBuild);

        query.then(search => flatten(search).filter(search => search !== undefined))
          .then(query => {

            if (query.length === 0) {
              console.log("yuppy")
              this.setState({
                validation: 'error',
                helpMessage: 'Invalid gene name.',
                variants: [],
                region: searchRegion
              })
            } else {
              return this.handleCoordinateQuery(query[0], multiple, true)
            }
          });

      } else { //regular query
        var coords = searchRegion.trim().split(/[:-]/, 3);

        //for searching at only single position, because there is no need to specify range
        if (coords.length === 2) {
          coords.push(coords[1]);
        }

        if (multiple === false) {

          if (!this.state.translation) {
            this.setState({
              translation: false,
              original: undefined,
              region: searchRegion
            });
          } else {
            this.setState({
              region: searchRegion
            });
          }

          this.props.source.variants(coords[0], parseInt(coords[1]), parseInt(coords[2])).then(
            variants => {
              this.setState({
                variants: variants,
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
            <Col sm={6} lg={8}>
              {this.state.translation && <p>{this.state.original} transformed into {this.state.region}</p>}
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
