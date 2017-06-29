/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Q from 'q';

import { Table } from 'react-bootstrap';

import VCFSource from '../../../lib/js/io/VCFSource';

class SingleVariantTrait extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      genotype : undefined
    };
  };

  componentWillMount() {
    // Use assumeRefRef to always get variant
    const query = this.props.trait.variant;
    this.props.source.variant(query.chr, query.pos, query.ref, query.alt, true).then(variant => {
      if (variant) {
        // TODO: Enable selecting genotype by sample
        this.setState({ genotype: variant.genotype() });
      }
    });
  }

  render() {
    return (
      <div>
      <h3>{ this.props.trait.title }</h3>
      <Table bordered={true}>
        <thead>
          <tr><th>Genotype</th><th>Phenotype</th></tr>
        </thead>
        <tbody>
          { this.props.trait.association.map(assoc =>
            <tr 
              key={assoc.genotype}  
              style={ (this.state.genotype === assoc.genotype) ? {backgroundColor:"#ffff99"} : {backgroundColor:"#ffffff"}
 }
            >
              <td>{assoc.genotype}</td>
              <td>{assoc.phenotype}</td>
            </tr>
          ) }
        </tbody>
      </Table>
      { this.props.children }
      </div>
    );
  }
}

SingleVariantTrait.propTypes = {
	source: PropTypes.instanceOf(VCFSource).isRequired,
  trait: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired
};


export default SingleVariantTrait;
