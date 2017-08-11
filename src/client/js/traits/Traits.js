/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Link, BrowserRouter } from 'react-router-dom';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Form, FormGroup, ControlLabel, FormControl, Row, Col } from 'react-bootstrap';

import SingleVariantTrait from './SingleVariantTrait';

import VCFSource from '../../../lib/js/io/VCFSource';

const traitsData = {
  asparagus : {
    title: "Asparagus Anosmia",
    variant: { hg19: {chr: 1, pos: 248496863}, hg38: {chr: 1, pos: 248333561}, ref: "T", alt: "C" },
    association: [
      { genotype: "T/T", phenotype: "Most likely to smell asparagus metabolites in urine" },
      { genotype: ["T/C", "C/T"], phenotype: "More likely to smell asparagus metabolites in urine" },
      { genotype: "C/C", phenotype: "Least likely to smell asparagus metabolites in urine" }
    ],
    description: "Background on this particular phenotype"
  },
  earwax : {
    title: "Earwax Consistency",
    variant: { hg19: {chr: 16, pos: 48258198}, hg38: {chr: 16, pos: 48224287}, ref: "C", alt: "T"},
    association: [
      { genotype: "C/C", phenotype: "Wet earwax" },
      { genotype: ["C/T","T/C"], phenotype: "Wet earwax" },
      { genotype: "T/T", phenotype: "Dry earwax" }
    ],
    description: (<p>This <abbr title="Single Nucleotide Polymorphism">SNP</abbr> in the <i>ABCC11</i> gene
    determines human earwax consistency. The TT genotype
    is associated with a "dry earwax", while CC and CT are associated with
    wet earwax. This SNP is also a proxy for East Asian ancestry; the T
    allele is more common in East Asian populations. [<a target="_blank"
    href="https://www.ncbi.nlm.nih.gov/pubmed/16444273">PMID
    16444273</a>]</p>)
  },
  sprinting : {
    title: "Sprinting Performance",
    variant: { hg19: {chr: 11, pos: 66328095}, hg38: {chr: 11, pos: 66560624}, ref: "T", alt: "C"},
    association: [
      { genotype: "C/C", phenotype: "Likely a sprinter" },
      { genotype: ["T/C","C/T"], phenotype: "Likely a sprinter" },
      { genotype: "T/T", phenotype: "Likely an endurance athlete" }
    ],
    description: "Background on this particular phenotype"
  }
}

class Traits extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      referenceGenome: undefined
    };
  }

  componentDidMount() {
    this.props.source.reference().then(ref => {
      this.setState({ referenceGenome: ref.shortName });
    });
  }

  render() {
    const { source, settings } = this.props;
    let routes = Object.keys(traitsData).map(trait => (
      { path: `/traits/${trait}`,
        exact: true,
        main: () => <SingleVariantTrait source={source} settings={settings} trait={traitsData[trait]}/>,
        title: traitsData[trait].title
      }
    ))

    routes.unshift(
      { path: '/traits',
        exact: true,
        main: () => <h2>Physical Traits</h2>
      }
    )

    return (
      <Row>
        <Col sm={3}>
          <h4><Link to='/traits'>Trait Analyses</Link></h4>
          <ul className={ "list-unstyled"}>
            {routes.slice(1).map( (trait, index) => (
                <li key={index}><Link to={trait.path}>{trait.title}</Link></li>
              )
            )}
          </ul>
        </Col>
        <Col sm={9}>
          <Switch>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                exact={route.exact}
                render={route.main}
              />
            ))}
            <Route render= {() => <h1>404: Trait Not Found</h1>}/>
          </Switch>
        </Col>
      </Row>
    );
  }
}

Traits.propTypes = {
  settings: PropTypes.object.isRequired,
	source: PropTypes.instanceOf(VCFSource).isRequired
};

export default Traits;
