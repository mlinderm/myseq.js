/**
 * @flow
 */
'use strict';

import React from 'react';

import { Tab, Row, Col, Nav, NavItem } from 'react-bootstrap';

class Help extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      activeTab: (props.location.hash || "#about").slice(1)  
    };
  
    this.handleSelect = this.handleSelect.bind(this);
  }
  
  componentWillReceiveProps(nextProps) {
    let nextHash = nextProps.location.hash;
    if (nextHash && nextHash !== this.props.location.has) {
      this.setState({ activeTab: nextHash.slice(1) });  
    }
  }

  handleSelect(key) {
    this.setState({ activeTab: key});
  }

  render(): any {
    return (
      <Tab.Container id="help-tabs" activeKey={this.state.activeTab} onSelect={this.handleSelect}>
        <Row className="clearfix">
          <Col sm={3}>
            <Nav bsStyle="pills" stacked>
              <NavItem eventKey="how">How MySeq Works</NavItem>
              <NavItem eventKey="glossary">Glossary</NavItem>
              <NavItem eventKey="about">About MySeq</NavItem>
            </Nav>
          </Col>
          <Col sm={9}>
            <Tab.Content animation>
              <Tab.Pane eventKey="about">
                MySeq.js is an educational tool and research project created at Middlebury College.
              </Tab.Pane>
              <Tab.Pane eventKey="glossary">
                <dl>
                  <dt>Variant Call Format (VCF)</dt>
                  <dd>
                  
                  The Variant Call Format (VCF) is one of the most common
                  formats for storing variant calls. Each line in a VCF file
                  encodes a genetic variant and each sample's genotype for that
                  variant. VCF files are typically stored in a compressed
                  format with an accompanying index file to enable efficient
                  queries by genomic coordinates.
                  
                  </dd>
                </dl>
              </Tab.Pane>
              <Tab.Pane eventKey="how">
                
                MySeq.js queries and analyzes VCF files stored locally on the
                user's computer or available remotely. MySeq.js performs all
                analyses within the user's browser. No genotypes are ever sent
                to an external server.
              
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    );
  }  
}

export default Help;
