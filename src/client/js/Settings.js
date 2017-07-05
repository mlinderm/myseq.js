/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import { Form, FormGroup, ControlLabel, HelpBlock, Checkbox } from 'react-bootstrap';


class Settings extends React.Component {
  constructor(props) {
    super(props);
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
      </Form>
    );
  }
}

Settings.propTypes = {
  settings: PropTypes.object,
  updateSettings: PropTypes.func  
};


export default Settings;
