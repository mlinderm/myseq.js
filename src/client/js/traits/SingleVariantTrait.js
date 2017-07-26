/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Q from 'q';

import { Alert, Table, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import VCFSource from '../../../lib/js/io/VCFSource';

class SingleVariantTrait extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      genotype : undefined,
      showSettingsAlert: false
    };
    
    this.handleAlertDismiss = this.handleAlertDismiss.bind(this);
  };

  componentDidMount() {
    // Use assumeRefRef to always get variant
    const { sample, assumeRefRef } = this.props.settings;
    const query = this.props.trait.variant;
    this.props.source.variant(query.chr, query.pos, query.ref, query.alt, assumeRefRef).then(variant => {
      if (variant) {
        this.setState({ genotype: variant.genotype(sample) });
      } else {
        this.setState({ showSettingsAlert: true });
      }
    });
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
        <Row>
        <Col sm={6}>
        Querying the genotype for variant { `${query.chr}:g.${query.pos}${query.ref}>${query.alt}` }:
        <Table bordered={true}>
          <thead>
            <tr><th>Genotype</th><th>Phenotype</th></tr>
          </thead>
          <tbody>
            { this.props.trait.association.map(assoc =>
              <tr 
                key={assoc.genotype}  
                className={ (this.state.genotype === assoc.genotype) && "info" }
              >
                <td>{assoc.genotype}</td>
                <td>{assoc.phenotype}</td>
              </tr>
            ) }
          </tbody>
        </Table>
        </Col>
        <Col sm={6}>
          { this.props.children }
        </Col>
        </Row>
      </div>
    );
  }
}

SingleVariantTrait.propTypes = {
  settings: PropTypes.object.isRequired,
	source: PropTypes.instanceOf(VCFSource).isRequired,
  trait: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired
};


export default SingleVariantTrait;
