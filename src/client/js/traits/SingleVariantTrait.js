/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Q from 'q';

import VCFSource from '../../../lib/js/io/VCFSource';


//takes "source" and single "trait"
//single variant phenotype table whos props are variant and association Array
// single, then call source.variantbyVAriant().this(variant=>{
//if (variant.Length) this.setState({currentGT: variant GT})}

class SingleVariantTrait extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      genotype : undefined
    };
  };

  componentWillMount() {
    const query = this.props.trait.variant;
    this.props.source.variant(query.chr, query.pos, query.ref, query.alt).then(variant => {
      if (variant) {
        // TODO: Enable selecting genotype by sample
        this.setState({ genotype: variant.genotype() });
      }
    });
  }

  render() {
    return (
      <div>
      <table>
        <thead>
          <tr><th>Genotype</th><th>Phenotype</th></tr>
        </thead>
        <tbody>
          { this.props.trait.association.map(assoc =>
            <tr 
              key={assoc.genotype}  
              style={ (this.state.genotype === assoc.genotype) ? {color:"#d0021b"} : {color:"#000000"} }
            >
              <td>{assoc.genotype}</td>
              <td>{assoc.phenotype}</td>
            </tr>
          ) }
        </tbody>
      </table>
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
