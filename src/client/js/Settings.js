/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import { Form, FormGroup, FormControl, ControlLabel, HelpBlock, Checkbox, Row, Col } from 'react-bootstrap';

import VCFSource from '../../lib/js/io/VCFSource';


class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reference: undefined
    };
    this.handleReferenceChange = this.handleReferenceChange.bind(this);
  }

  componentDidMount() {
    this.props.source.reference().then(ref => {
      this.setState({ reference: ref.shortName });
    });
  }

  componentWillReceiveProps(nextProps) {
    nextProps.source.reference().then(ref => {
      if (ref.shortName !== this.state.shortName) {
        this.setState({ reference: ref.shortName });
      }
    });
  }

  handleReferenceChange(event) {
    this.props.updateReference(event.target.value);
  }

  render() {
    const { settings, updateSettings } = this.props;
    return(
      <Form>
        <FormGroup>
          <Checkbox checked={settings.assumeRefRef} onChange={
            event => updateSettings({ assumeRefRef: !settings.assumeRefRef })
          }>
            Assume missing variants have reference genotype
          </Checkbox>
          <HelpBlock>

            Select when analyzing whole genome sequencing (WGS) data. Most WGS
            analysis pipelines only report sites different from the reference
            genome. When this option is selected, MySeq will assume that
            unreported sites have homozygous reference genotypes.

          </HelpBlock>
        </FormGroup>

        <FormGroup validationState="warning">
          <ControlLabel>Reference Genome</ControlLabel>
          <Row>
            <Col sm={2}>
              <FormControl componentClass="select" value={ this.state.reference } onChange={ this.handleReferenceChange }>
                <option value="hg19">Human (hg19)</option>
                <option value="b37">Human (b37)</option>
              </FormControl>
            </Col>
          </Row>
          <HelpBlock>

            Change the reference genome. Generally you should not need to
            manually set the reference genome. MySeq will infer the reference
            for you. However, there may be corner cases that require you to
            override MySeq's choice.

          </HelpBlock>
        </FormGroup>
      </Form>
    );
  }
}

Settings.propTypes = {
  source: PropTypes.instanceOf(VCFSource),
  settings: PropTypes.object,
  updateSettings: PropTypes.func
};


export default Settings;
