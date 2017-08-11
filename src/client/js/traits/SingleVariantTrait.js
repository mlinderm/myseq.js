/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Q from 'q';

import { Alert, Table, Row, Col } from 'react-bootstrap';

import VCFSource from '../../../lib/js/io/VCFSource';
import { Route, Switch, Link } from 'react-router-dom';

class SingleVariantTrait extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      referenceGenome: undefined,
      genotype : undefined,
      showSettingsAlert: false
    };

    this.handleAlertDismiss = this.handleAlertDismiss.bind(this);
  };

  componentDidMount() {
    // Use assumeRefRef to always get variant
    const { sample, assumeRefRef } = this.props.settings;
    const query = this.props.trait.variant;

    this.props.source.reference().then(ref => {
      console.log("testy");
      this.setState({ referenceGenome: ref.shortName });

    }).then( () => {
      this.props.source.variant(
        (this.state.referenceGenome === "hg38") ? query.hg38.chr : query.hg19.chr,
        (this.state.referenceGenome === "hg38") ? query.hg38.chr : query.hg19.pos,
        query.ref,
        query.alt,
        assumeRefRef)
        .then(variant => {
          if (variant) {
            this.setState({ genotype: variant.genotype(sample) });
          } else {
            this.setState({ showSettingsAlert: true });
          }
        });
    }, () => console.log("error"));
  }

  handleAlertDismiss(e) {
		e.preventDefault();
		this.setState({ showSettingsAlert: false });
	}


  render() {
    const { trait, settings } = this.props;
    const query = trait.variant;
    return (
      <div>
        <h3>{ trait.title }</h3>
        { this.state.showSettingsAlert && !settings.assumeRefRef &&
          <Alert bsStyle="info" onDismiss={this.handleAlertDismiss}>
            <h4>Nothing highlighted?</h4>
            <p>
              If you are analyzing whole genome sequencing (WGS) data consider
              setting MySeq to assume the genotype of missing variants. You
              can do so on the <Link to='/settings'>settings</Link> page.
            </p>
          </Alert>
        }
        Querying the genotype for variant { `${(this.state.referenceGenome === "hg38") ? query.hg38.chr : query.hg19.chr}:g.${(this.state.referenceGenome === "hg38") ? query.hg38.pos : query.hg19.pos}${query.ref}>${query.alt}` }:
        <Table bordered={true}>
          <thead>
            <tr><th>Genotype</th><th>Phenotype</th></tr>
          </thead>
          <tbody>
            { trait.association.map(assoc =>
              <tr
                key={assoc.genotype}
                className={ (Array.isArray(assoc.genotype) ? assoc.genotype.indexOf(this.state.genotype) > -1 :  this.state.genotype === assoc.genotype) && "info" }
              >
                <td>{Array.isArray(assoc.genotype) ? assoc.genotype[0] : assoc.genotype}</td>
                <td>{assoc.phenotype}</td>
              </tr>
            ) }
          </tbody>
        </Table>
        { trait.description }
      </div>
    );
  }
}

SingleVariantTrait.propTypes = {
  settings: PropTypes.object.isRequired,
	source: PropTypes.instanceOf(VCFSource).isRequired,
  trait: PropTypes.object.isRequired,
};


export default SingleVariantTrait;
