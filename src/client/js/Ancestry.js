/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import _  from 'lodash';

import { VictoryBar, VictoryContainer, VictoryLegend, VictoryLabel, VictoryLine, VictoryChart, VictoryTheme, VictoryScatter , VictoryAxis} from 'victory';

const LOADINGS = [
  {rsid: "rs798443", pcas: [-0.49543527, 0.3313103, -0.001405499, 0.095723573], avg: 0.9143002, counted: "G", alt: "A", hg38:{chr: 1, pos: 1}, hg19:{chr: "2", pos: 7968275}},
  {rsid: "rs1569175", pcas: [0.08765856, 0.3405988, -0.798909908, -0.470842554], avg: 0.2783245, counted: "T", alt: "C", hg38:{chr: 1, pos: 1}, hg19:{chr: "2", pos: 201021954}},
  {rsid: "rs1369093", pcas: [-0.07946558, 0.4746370, 0.167476901, 0.199323914], avg: 0.4419314, counted: "C", alt: "T", hg38:{chr: 1, pos: 1}, hg19:{chr: "4", pos: 73245191}},
  {rsid: "rs2702414", pcas: [0.39173184, 0.2588608, 0.282067922, -0.295312937], avg: 0.3785282, counted: "A", alt: "G", hg38:{chr: 1, pos: 1}, hg19:{chr: "4", pos: 179399523}},
  {rsid: "rs2397060", pcas: [-0.52247504, 0.2495252, -0.036654457, -0.003702511], avg: 0.6712951, counted: "C", alt: "T", hg38:{chr: 1, pos: 1}, hg19:{chr: "6", pos: 51611470}},
  {rsid: "rs731257", pcas: [0.43126849, 0.2390917, 0.168186951, -0.140197629], avg: 0.3840141, counted: "A", alt: "G", hg38:{chr: 1, pos: 1}, hg19:{chr: "7", pos: 12669251}},
  {rsid: "rs2001907", pcas: [0.35774332, 0.2556221, -0.344821456, 0.782510379], avg: 0.2563004, counted: "T", alt: "C", hg38:{chr: 1, pos: 1}, hg19:{chr: "8", pos: 140241181}},
  {rsid: "rs200354", pcas: [-0.01175972, -0.5451297, -0.324958340, 0.101059171], avg: 0.9989853, counted: "G", alt: "G", hg38:{chr: 1, pos: 1}, hg19:{chr: "14", pos: 99375321}}
]

// const AVGS = {
//   rs798443: 0.9143002,
//   rs1569175: 0.2783245,
//   rs1369093: 0.4419314,
//   rs2702414: 0.3785282,
//   rs2397060: 0.6712951,
//   rs731257: 0.3840141,
//   rs2001907: 0.2563004,
//   rs200354: 0.9989853
// }
//
// const COUNTED = {
//   rs798443: "G",
//   rs1569175: "T",
//   rs1369093: "C",
//   rs2702414: "A",
//   rs2397060: "C",
//   rs731257: "A",
//   rs2001907: "T",
//   rs200354: "G"
// }

/*
Look up rsId genotype
Score it with COUNTED
Center it with AVGS
Make N/A into 0s
Take product with LOADINGS
Plot
*/
function styleSvg(style, sourceProps) {

	if (style === undefined) style = {};
	if (sourceProps === undefined) return style;

	if (sourceProps.fill) {
		style.fill = sourceProps.fill.color;
		style.fillOpacity = sourceProps.fill.opacity;//!!sourceProps.fill.alpha? sourceProps.fill.alpha/100:1;
	}
	if (sourceProps.stroke) {
		style.stroke = sourceProps.stroke.color;
		style.strokeOpacity =!!sourceProps.stroke.alpha? sourceProps.stroke.alpha/100:1;
	}
	if (sourceProps.strokeWidth) style.strokeWidth = sourceProps.strokeWidth;
  if (sourceProps.transform) style.transform = sourceProps.transform;

	return style;
}

export class Ellipse extends React.Component {
    render() {
        var strokeWidth = this.props.strokeWidth || 0;
        var rx = this.props.rx || 0;
        var ry = this.props.ry || 0;
        var cx = this.props.cx || 0;
        var cy = this.props.cy || 0;

        var height = 1000; //(ry * 2) + 2 * strokeWidth;
        var width = 1000; //(rx * 2) + 2 * strokeWidth;

        // var cx = rx + (strokeWidth / 2);
        // var cy = ry + (strokeWidth / 2);

        var props = styleSvg(_.omit(this.props, 'style'),this.props);

        return (
            <svg height={height} width={width}>
                <ellipse {...props} cx={cx} cy={cy}>{this.props.children}</ellipse>
            </svg>)

    }
}


class CatPoint extends React.Component {
  render() {
    const {x, y, datum} = this.props;
    return (
      <Ellipse rx={100} ry={50} cx={x} cy={y} fill={{color:'#2409ba', opacity:".1"}} transform={"translate(0, 0) rotate(0 0 0)"}/>
    );
  }
}

class Ancestry extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      referenceGenome: undefined,
      pcas: undefined
    }
  }

  componentDidMount() {
    // Use assumeRefRef to always get variant
    const { sample, assumeRefRef } = this.props.settings;

    this.props.source.reference()
    .then(ref => {
      this.setState({ referenceGenome: ref.shortName });
    })
    .then( () => {
      let promises = LOADINGS.map(entry => {
        return this.props.source.variant(
          (this.state.referenceGenome === "hg38") ? entry.hg38.chr : entry.hg19.chr,
          (this.state.referenceGenome === "hg38") ? entry.hg38.chr : entry.hg19.pos,
          entry.counted,
          entry.alt,
          assumeRefRef
        )
      })

      return Promise.all(promises);

    }, () => console.log("error"))
    .then(variants => {
      //console.log(variants);
      let counts = variants.map((variant, index) => {
        let gt = (variant !== undefined) ? variant.genotype(sample) : 0; //what should it be if nothing was found, should we require user to check ref/ref
        let centered = 0;

        if (gt !== 0) {
          gt = gt.split("/");
          gt = gt.filter(allele => allele === LOADINGS[index].counted);
          gt = gt.length;

          //(X - refDat$AVG) / sqrt(refDat$AVG * (1 - (refDat$AVG / 2)))
          let avg = LOADINGS[index].avg;
          centered = (gt - avg) / Math.sqrt(avg * (1 - avg/2));
        }
        return centered
      })
      //console.log(counts)

      let pca1 = 0;
      let pca2 = 0;
      let pca3 = 0;
      let pca4 = 0;

      counts.forEach((count, index) => {
        pca1 = pca1 + count*LOADINGS[index]["pcas"][0];
        pca2 = pca2 + count*LOADINGS[index]["pcas"][1];
        pca3 = pca3 + count*LOADINGS[index]["pcas"][2];
        pca4 = pca4 + count*LOADINGS[index]["pcas"][3];
      })
      let pcas = [pca1, pca2, pca3, pca4];

      this.setState({pcas : pcas});
    })
  }

  render() {
    let x = 0
    let y = 0
    if (this.state.pcas) {
      x = this.state.pcas[0];
      y = this.state.pcas[1];
    }

    let chartData = [{x: x, y: y, label: "you"}];

    return (
      <div>
        <div>Hello World!</div>
        <div>{chartData[0].x},{chartData[0].y}</div>
        <div>{x},{y}</div>
        <VictoryChart
          theme={VictoryTheme.material}
          width={400}
          height={400}
        >
          <VictoryAxis crossAxis
            label= "PCA1"
            tickValues={[-5,-4,-3,-2,-1,0,1,2,3,4,5]}
            style={{
              axisLabel: {fontSize: 14, padding: 160},
              ticks: {stroke: "grey", size: 5},
              tickLabels: {fontSize: 12, padding: 5}
            }}
          />
          <VictoryAxis dependentAxis crossAxis
            label= "PCA2"
            tickValues={[-5,-4,-3,-2,-1,0,1,2,3,4,5]}
            style={{
              axisLabel: {fontSize: 14, padding: 160},
              ticks: {stroke: "grey", size: 5},
              tickLabels: {fontSize: 12, padding: 5}
            }}
          />
          <VictoryScatter
            data={chartData}
            style={{
              labels: { fontSize: 8 }
            }}
          />
          <VictoryScatter
            data={chartData}
            style={{
              labels: { fontSize: 8 }
            }}
            dataComponent={<CatPoint/>}
          />
        </VictoryChart>
      </div>
    );
  }
}



Ancestry.propTypes = {

};

export default Ancestry;
