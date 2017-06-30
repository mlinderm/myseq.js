import React from 'react';
import PropTypes from 'prop-types';
import Q from 'q';

import VCFSource from '../../../lib/js/io/VCFSource';

import { Table } from 'react-bootstrap';

class RiskTable extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      gtAndLR : new Array(this.props.riskVariants.length).fill({
        GT: undefined,
        LR: undefined
      })
    };
  }

  componentWillMount() {
    let allVariants= Q.all(this.props.riskVariants.map(variant => {
      let query = variant.variant; 
      
      // Return promise for individual query variant
      return this.props.source.variant(
        query.chr, query.pos, query.ref, query.alt, true /* assumeRefRef */      
      );
    }));
    
    allVariants.then(foundVariants => {
      let localGTAndLR = this.state.gtAndLR;
      foundVariants.map((variant, index) => {
        if (variant) {
          let gt = variant.genotype();
          localGTAndLR[index] = { GT: gt, LR: this.props.riskVariants[index].LR[gt] };
        }
      });
      this.setState({ gtAndLR : localGTAndLR });
    });
    
    // TODO: Compute the product of the LRs to determine post-test risk
  }
  
  render() {
    return (
      <div>
        <Table bordered={true}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Genotype</th>
              <th>LR</th>
            </tr>
          </thead>
          <tbody>
            {this.props.riskVariants.map((variant, index) =>
              <tr key={variant.variant.id}>
                <td>{variant.variant.id}</td>
                <td>{this.state.gtAndLR[index].GT}</td>
                <td>{this.state.gtAndLR[index].LR}</td>
              </tr>
            )}
          </tbody>
        </Table>
        { this.props.children } 
      </div>
    );
  }
}

RiskTable.propTypes = {
  source: PropTypes.instanceOf(VCFSource).isRequired,
  riskVariants: PropTypes.array,
  children: PropTypes.element.isRequired
};

export default RiskTable;
