import React from 'react';
import PropTypes from 'prop-types';
import Q from 'q';

import VCFSource from '../../../lib/js/io/VCFSource';

import { Table } from 'react-bootstrap';
import { VictoryBar, VictoryContainer, VictoryLegend, VictoryLabel, VictoryLine, VictoryChart, VictoryTheme, VictoryScatter , VictoryAxis} from 'victory';
import { Grid, Row, Col } from 'react-bootstrap';
// { VictoryLine, VictoryChart, VictoryTheme, VictoryScatter }

class RiskTable extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      postTestRisk : 0,

      data : this.props.riskVariants.map( (variant, index) => {return ({
        GT: undefined,
        LR: undefined,
        cumalitiveLR: undefined,
        position: index,
        label: variant.variant.id
      })}),

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
      let localdata = this.state.data;

      foundVariants.map((variant, index) => {
        if (variant) {
          let gt = variant.genotype(sample);
          localdata[index] = { GT: gt, LR: this.props.riskVariants[index].LR[gt], cumalitiveLR: undefined, label: localdata[index].label, position: localdata[index].position};
        }
      });

      //sort local data
      localdata.sort((a, b) => {
        if (a.LR == undefined) {
          return 1;
        } else if (b.LR == undefined) {
          return -1;
        } else {
          var distance1 = Math.abs(1 - a.LR);
          var distance2 = Math.abs(1 - b.LR);

          return distance1 == distance2 ? 0 : (distance1 > distance2 ? 1 : -1);
        }
      });

      //calculate cumalitiveLR
      let cumalitiveLRTemp = new Array(localdata.length).fill(undefined);

      localdata = localdata.map((entry,index) =>{
        if (entry.LR != undefined) {
          if (index == 0) {
            cumalitiveLRTemp[index] = entry.LR;
            this.setState({postTestRisk : entry.LR});
          } else {
            cumalitiveLRTemp[index] = cumalitiveLRTemp[index-1] * entry.LR;
            this.setState({postTestRisk : cumalitiveLRTemp[index-1] * entry.LR});
          }
        }

        return ({GT: entry.GT, LR: entry.LR, cumalitiveLR: cumalitiveLRTemp[index], label: entry.label, position: entry.position})
      })

      this.setState({ data : localdata });
    })
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


    let labeledData = this.state.data.map((variant, index) => {return({x: undefined, y: variant.cumalitiveLR, label: variant.label, gt:variant.GT, lr:variant.LR})});

    // points for plot
    let filteredLabeledData = labeledData.filter(object => object.y != undefined);
    filteredLabeledData.unshift({x:  undefined, y: 1, label: undefined});
    let chartData = filteredLabeledData.map((entry, index) => {return({x: index, y: entry.y*this.props.preRisk, label: entry.label})});
    // console.log(chartData);

    // math for plot axes
    let axis = chartData.map(value => Math.floor(value.y));
    let rangeLimits = axis.sort((a,b) => a-b); //sort from smallest to largest
    let axisRange = range(rangeLimits[0],rangeLimits[rangeLimits.length-1]+2);
    let averageData = [{x:0, y:this.props.preRisk}, {x:chartData.length-1, y:this.props.preRisk}];
    // console.log(axisRange);

    // style={{borderSpacing:0, border:"0 none",  borderTop: "none !important", borderBottom: 0}}
    //condensed={true} style={{borderSpacing:0, borderCollapse: "collapse", border:"0 none",  borderTop: "none !important", borderBottom: 0}}
    return (
      <div>
        <Table bordered={false}>
          <tbody>
            <tr>
              <td>
                <h4>Pre-Test Risk: {this.props.preRisk}{"%"}</h4>
              </td>
              <td
                style={{
                  width: "50%",
                }}
              >
                <div style={{height:"40px", width:this.props.preRisk * 5, backgroundColor:"#ff0000"}}></div>
              </td>
            </tr>
            <tr>
              <td>
                <h4>Post-Test Risk: {Math.round(this.state.postTestRisk * this.props.preRisk * 100) / 100}{"%"}</h4>
              </td>
              <td
                style={{
                  width: "50%",
                }}
              >
                <div style={{height:"40px", width:this.state.postTestRisk*this.props.preRisk*5, backgroundColor:"#A9A9A9"}}></div>
              </td>
            </tr>
          </tbody>
        </Table>

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

              <Row>
                <Col xs={10} md={8} lg={7}>
                  <VictoryChart
                    theme={VictoryTheme.material}
                    width={400}
                    height={400}
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
                        parent: { border: "1px solid #ccc"},
                        labels: { fontSize: 0 }
                      }}
                      data={chartData}
                    />
                    <VictoryLine
                      style={{
                        data: { stroke: "#ff0000" }
                      }}
                      data={averageData}
                    />
                    <VictoryScatter
                      data={chartData}
                      style={{
                        labels: { fontSize: 8 }
                      }}
                    />
                  </VictoryChart>
                </Col>
                <Col xs={1} md={1} lg={1}>
                  <div
                    style = {{
                      // display:"inline-block",
                      // verticalAlign:"middle",
                      marginTop: "230px"
                    }}
                  >
                    <VictoryLegend
                      data={[
                        {name: 'Risk Percentage', symbol: { type: 'circle', fill: "#A9A9A9"}},
                        {name: 'Average Population Risk', symbol: { type: 'circle', fill:"#ff0000"}},
                        ]}
                      padding={20}
                      style={{
                        labels: { fontSize: 18 },
                      }}
                    />
                  </div>
                </Col>
              </Row>

        </div>
      </div>
    );
  }
}
// put into attributes of victorychart         containerComponent={<VictoryContainer responsive={false}/>}
//need to figure out layout still

RiskTable.propTypes = {
  settings: PropTypes.object.isRequired,
  source: PropTypes.instanceOf(VCFSource).isRequired,
  riskVariants: PropTypes.array.isRequired,
  preRisk: PropTypes.number.isRequired,
  children: PropTypes.element
};

export default RiskTable;
