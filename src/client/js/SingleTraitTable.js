import React from 'react';
import PropTypes from 'prop-types';
import Q from 'q';

import { LocalFileReader, RemoteFileReader } from '../../lib/js/io/FileReaders-browser';
import TabixIndexedFile from '../../lib/js/io/TabixIndexedFile';
import VCFSource from '../../lib/js/io/VCFSource';


//takes "source" and single "trait"
//single variant phenotype table whos props are variant and association Array
// single, then call source.variantbyVAriant().this(variant=>{
//if (variant.Length) this.setState({currentGT: variant GT})}

class SingleTraitTable extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      listOfTraits : [],
      genotype : ""
    };

  };

  componentWillMount() {
    var tempTraitList = [];
    var tempPresentList = [];

    var traitVariant;

    //later this.props.trait
    this.props.trait.association.map(trait => {tempTraitList.push(trait);});
    this.setState({ listOfTraits:tempTraitList });

    traitVariant = this.props.trait.variant;

    this.props.source.variantByVariant("chr" + traitVariant.chr, traitVariant.pos, traitVariant.ref,
      traitVariant.alt).then(variant => {if (variant.length > 0) {
                                          this.setState({genotype:variant[0].genotype()})
                                        };
                                        });
  }

  render() {
    return (
      <table>
          <thead>
              <tr>
                <th>Genotype</th>
                <th>Phenotype</th>
              </tr>
          </thead>
          <tbody>
            {this.state.listOfTraits.map(list =>
            <tr style={(this.state.genotype === list[0]) ?
                      {color:"#d0021b"} : {color:"#000000"}
                      }
                key={list[1]}>
              <td>{list[0]}</td>
              <td>{list[1]}</td>
            </tr>
          )}
          </tbody>
      </table>
    )
  };
}

export default SingleTraitTable;
