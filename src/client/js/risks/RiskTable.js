import React from 'react';
import PropTypes from 'prop-types';
import Q from 'q';

import VCFSource from '../../../lib/js/io/VCFSource';

import { Table } from 'react-bootstrap';
import { VictoryLabel, VictoryLine, VictoryChart, VictoryTheme, VictoryScatter , VictoryAxis} from 'victory';
// { VictoryLine, VictoryChart, VictoryTheme, VictoryScatter }

class RiskTable extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      gtAndLR : new Array(this.props.riskVariants.length).fill({
        GT: undefined,
        LR: undefined
      }),

      postTestRiskList : new Array(this.props.riskVariants.length).fill(0),

      data : undefined

    };
  }

  componentDidMount() {

    const { sample, assumeRefRef } = this.props.settings;
    let allVariants= Q.all(this.props.riskVariants.map(variant => {
      let query = variant.variant;

      // Return promise for individual query variant
      return this.props.source.variant(
        query.chr, query.pos, query.ref, query.alt, assumeRefRef
      );
    }));

    allVariants.then(foundVariants => {
      let localGTAndLR = this.state.gtAndLR;

      foundVariants.map((variant, index) => {
        if (variant) {
          let gt = variant.genotype(sample);
          localGTAndLR[index] = { GT: gt, LR: this.props.riskVariants[index].LR[gt] };
        }
      });

      this.setState({ gtAndLR : localGTAndLR });
    })

    // .then(() => { // making data object
    //   let dataTemp = this.props.riskVariants.map((variant, index) => {return({x: undefined, y: undefined, label: variant.variant.id, gt:this.state.gtAndLR[index].GT, lr:this.state.gtAndLR[index].LR})});
    //   // sorting can be done here
    //   this.setState({data:dataTemp});
    //
    // }).then(() => {
    //   let localPostTestRisk = this.state.postTestRiskList;
    //
    //   this.state.data.map((entry,index) => {
    //     if (entry.lr != undefined) {
    //       if (index == 0) { //make into ternary
    //         localPostTestRisk[index] = entry.lr;
    //         console.log(localPostTestRisk);
    //       } else {
    //         localPostTestRisk[index] = lastIndexWithValue(index-1, localPostTestRisk) * entry.lr;
    //       }
    //     }
    //   })
    //
    //   setState({postTestRiskList : localPostTestRisk})
    // });

    // TODO: Compute the product of the LRs to determine post-test risk

    function lastIndexWithValue(index, list) {
      if (list[index] != 0) {
        return (list[index]);
      } else {
        return (lastIndexWithValue(index-1, list));
      }
    }

    allVariants.then(foundVariants => {
      let localPostTestRisk = this.state.postTestRiskList;

      foundVariants.map((variant, index) => {
        if (variant) {
          let gt = variant.genotype(sample);

          if (index == 0) { //make into ternary
            localPostTestRisk[index] = this.props.riskVariants[index].LR[gt];
          } else {
            localPostTestRisk[index] = lastIndexWithValue(index-1, localPostTestRisk) * this.props.riskVariants[index].LR[gt];
          }
        }
      });
      this.setState({postTestRiskList : localPostTestRisk});
    });

  }

  render() {
    function range(start, stop, step) {
      if (typeof stop == 'undefined') {
          stop = start;
          start = 0;
      }

      if (typeof step == 'undefined') {
          step = 1;
      }

      if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
          return [];
      }

      var result = [];
      for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
          result.push(i);
      }

      return result;
  };
    // let preData = this.state.postTestRiskList.sort(lr => Math.abs(1-lr));

    //TODO: need to sort numbers by distance from 1 or pre-test risk value
    // console.log(this.state.data);

    let labeledData = this.props.riskVariants.map((variant, index) => {return({x: undefined, y: this.state.postTestRiskList[index], label: variant.variant.id, gt:this.state.gtAndLR[index].GT, lr:this.state.gtAndLR[index].LR})});

    // points for plot
    let filteredLabeledData = labeledData.filter(object => object.y != 0);
    filteredLabeledData.unshift({x:  undefined, y: 1, label: undefined});
    let chartData = filteredLabeledData.map((entry, index) => {return({x: index, y: entry.y*this.props.preRisk, label: entry.label})});
    // console.log(chartData);

    // math for plot axes
    let axis = chartData.map(value => Math.floor(value.y));
    let rangeLimits = axis.sort((a,b) => a-b); //sort from smallest to largest
    let axisRange = range(rangeLimits[0],rangeLimits[rangeLimits.length-1]+2);
    let averageData = [{x:0, y:this.props.preRisk}, {x:chartData.length-1, y:this.props.preRisk}];
    // console.log(axisRange);

    return (
      <div>
        <h4>Pre-Test Risk: {this.props.preRisk}{"%"}</h4>
        <h4>Post-Test Risk: {this.state.postTestRiskList.slice(-1)*this.props.preRisk}{"%"}</h4>
        <Table bordered={true}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Genotype</th>
              <th>LR</th>
            </tr>
          </thead>
          <tbody>
            {labeledData.map((variant, index) =>
              <tr key={variant.label}>
                <td>{variant.label}</td>
                <td>{variant.gt}</td>
                <td>{variant.lr}</td>
              </tr>
            )}
          </tbody>
        </Table>
        { this.props.children }

        <br/>

        <div>
        <h3 style={{textAlign:"center"}}>Line Graph of Risk Percentage</h3>
        <VictoryChart
          theme={VictoryTheme.material}
          domainPadding={20}
          width={400}
        >
          <VictoryAxis crossAxis
            tickValues={[...Array(chartData.length).keys()].slice(1)}
            style={{
              axisLabel: {fontSize: 14, padding: 35},
              ticks: {stroke: "grey", size: 5},
              tickLabels: {fontSize: 12, padding: 5}
            }}
          />
          <VictoryAxis dependentAxis crossAxis
            tickValues={axisRange}
            label="Percentage"
            style={{
              axisLabel: {fontSize: 14, padding: 35},
              ticks: {stroke: "grey", size: 5},
              tickLabels: {fontSize: 12, padding: 5}
            }}
          />
          <VictoryLine
            style={{
              data: { stroke: "#A9A9A9" },
              parent: { border: "1px solid #ccc"}
            }}
            data={chartData}
          />
          <VictoryLine
            style={{
              data: { stroke: "#ff0000" },
            }}
            data={averageData}
          />
          <VictoryScatter
          data={chartData}
          />
        </VictoryChart>
        </div>
      </div>
    );
  }
}



RiskTable.propTypes = {
  settings: PropTypes.object.isRequired,
  source: PropTypes.instanceOf(VCFSource).isRequired,
  riskVariants: PropTypes.array.isRequired,
  preRisk: PropTypes.number.isRequired,
  children: PropTypes.element
};

export default RiskTable;
