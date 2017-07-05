/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Form, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import VCFSource from '../../lib/js/io/VCFSource';

class Navigation extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      samples : []
    };
    
    this.handleSampleChange = this.handleSampleChange.bind(this);
  }

  componentDidMount() {
    const { source } = this.props;
    source.samples().then(samples => {
      this.setState({ samples: samples });
    });
  }

  handleSampleChange(event) {
    this.props.updateSettings({ sample: event.target.value });
  }

  render(): any {
    const { settings } = this.props;
    const { samples } = this.state;
    
    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to='/'>MySeq</Link>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav>
          <NavDropdown eventKey={1} title="Analyses" id="analyses-nav-dropdown">
            <LinkContainer to="/query">
              <MenuItem eventKey={1.1}>Query Variants</MenuItem>
            </LinkContainer>
            <LinkContainer to="/traits">
              <MenuItem eventKey={1.2}>Physical Traits</MenuItem>
            </LinkContainer>
            <LinkContainer to="/risks">
              <MenuItem eventKey={1.3}>Common Disease Risk</MenuItem>
            </LinkContainer>
          </NavDropdown>
           <LinkContainer to="/settings">
            <NavItem eventKey={2}>Settings</NavItem>
          </LinkContainer>
        </Nav>
        <Navbar.Form pullRight>
          <FormGroup>
            <ControlLabel>Sample</ControlLabel>
            {' '}
            <FormControl componentClass="select" placeholder="None available" value={settings.sample || (samples && samples[0])} onChange={this.handleSampleChange}>
              {samples.map(sample => {
                return (<option key={sample} value={sample}>{sample}</option>);                                    
              })}
            </FormControl>
          </FormGroup>
        </Navbar.Form>
      </Navbar>
    );
  }
}

Navigation.propTypes = {
  source: PropTypes.instanceOf(VCFSource).isRequired,
  settings: PropTypes.object.isRequired,
  updateSettings: PropTypes.func.isRequired
};

export default Navigation;
