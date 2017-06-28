import React from 'react';
import PropTypes from 'prop-types';
import Q from 'q';

import TabixIndexedFile from '../../lib/js/io/TabixIndexedFile';
import VCFSource from '../../lib/js/io/VCFSource';

import { Table } from 'react-bootstrap';

//will take source and variants for disease
class RiskTable extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      riskyVariants : this.props.disease,
      filteredRiskyVariants : []
    };
  }

  componentWillMount() {
    var variants = this.state.riskyVariants;
    var searchs = [];
    var filterIndices = "";

    for (var i = 0; i < variants.length; ++i) {
      var variant = variants[i];
      searchs.push(this.props.source.variantByVariantandGT(variant.chr, variant.pos, variant.ref, variant.alt, variant.genotype));
    }

    Promise.all(searchs)
      .then(v=>{
        v.map(va=>{
            if (va.length > 0) {
              filterIndices = filterIndices + "1"
            } else {
              filterIndices = filterIndices + "0"
            }
        })},
        (error) => {console.log(error); })
        .then(()=> {
          for (var i = 0; i < filterIndices.length; ++i) {
              if (filterIndices[i] === "1") {
                var tempState = this.state.filteredRiskyVariants;
                tempState.push(this.state.riskyVariants[i])
                this.setState({filteredRiskyVariants:tempState});
              }
          }
        });
}

  render() {
    return (
      <div>
        <h3>Risk Table</h3>
        <Table bordered={true}>
          <thead>
              <tr>
                <th>Chromosome</th>
                <th>Position</th>
                <th>ID</th>
                <th>Referance</th>
                <th>Alternate</th>
                <th>Genotype</th>
                <th>AC</th>
                <th>OR</th>
                <th>AF</th>
                <th>LR</th>
              </tr>
          </thead>
          <tbody>
              {this.state.filteredRiskyVariants.map(list =>
              <tr key={String(list.id) + String(list.LR)}>
                <td>{list.chr}</td>
                <td>{list.pos}</td>
                <td>{list.id}</td>
                <td>{list.ref}</td>
                <td>{list.alt}</td>
                <td>{list.genotype}</td>
                <td>{list.AC}</td>
                <td>{list.OR}</td>
                <td>{list.AF}</td>
                <td>{list.LR}</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    )
  };
}


export default RiskTable;
