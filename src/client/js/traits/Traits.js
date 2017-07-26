/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Link, BrowserRouter } from 'react-router-dom';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Form, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

import SingleVariantTrait from './SingleVariantTrait';

import VCFSource from '../../../lib/js/io/VCFSource';

const traitsData = {
  asparagus : {
    title: "Asparagus Anosmia",
    variant: { chr: 1, pos: 248496863, ref: "T", alt: "C" },
    association: [
      { genotype: "T/T", phenotype: "Most likely to smell asparagus metabolites in urine" },
      { genotype: "T/C", phenotype: "More likely to smell asparagus metabolites in urine" },
      { genotype: "C/C", phenotype: "Least likely to smell asparagus metabolites in urine" }
    ],
    description: "Background on this particular phenotype"
  },
  earwax : {
    title: "Earwax Consistency",
    variant: { chr: 16, pos: 48258198, ref: "C", alt: "T"},
    association: [
      { genotype: "C/C", phenotype: "Wet earwax" },
      { genotype: "C/T", phenotype: "Wet earwax" },
      { genotype: "T/T", phenotype: "Dry earwax" }
    ],
    description: "Background on this particular phenotype"
  },
  sprinting : {
    title: "Sprinting Performance",
    variant: { chr: 11, pos: 66328095, ref: "T", alt: "C"},
    association: [
      { genotype: "C/C", phenotype: "Likely a sprinter" },
      { genotype: "T/C", phenotype: "Likely a sprinter" },
      { genotype: "T/T", phenotype: "Likely an endurance athlete" }
    ],
    description: "Background on this particular phenotype"
  }
}

class Traits extends React.Component {
  constructor(props) {
    super(props);
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
        main: () => <h2>Traits</h2>
      }
    )

    return (
        <div style={{ display: 'flex' }}>
          <div style={{
            padding: '15px',
            width: '30%',
            background: '#f0f0f0'
          }}>
            <div><Link to='/traits'>Home</Link></div>
            <ul style={{ padding: 10 }}>
              {routes.slice(1).map( (trait, index) => (
                  <li key={index}><Link to={trait.path}>{trait.title}</Link></li>
                )
              )}
            </ul>
          </div>
          <div style={{ flex: 1, padding: '10px' }}>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                exact={route.exact}
                render={route.main}
              />
            ))}
          </div>
        </div>
    )
  }
}

Traits.propTypes = {
  settings: PropTypes.object.isRequired,
	source: PropTypes.instanceOf(VCFSource).isRequired
};

export {
  Traits
};
