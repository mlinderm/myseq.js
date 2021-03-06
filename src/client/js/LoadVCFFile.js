/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import { Redirect } from 'react-router-dom';
import { Modal, Row, Col, Form, FormGroup, FormControl, ControlLabel, Button, HelpBlock } from 'react-bootstrap';

import { LocalFileReader, RemoteFileReader } from '../../lib/js/io/FileReaders-browser';
import TabixIndexedFile from '../../lib/js/io/TabixIndexedFile';
import VCFSource from '../../lib/js/io/VCFSource';
import { ReferenceGenome, hg19Reference, b37Reference } from '../../lib/js/features/ReferenceGenome';

class VCFLink extends React.Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(e) {
		e.preventDefault();
		this.props.updateAndSubmitURL(this.props.url, this.props.reference);
	}

	render() {
		return (
			<a href={this.props.url} onClick={this.handleClick}>{ this.props.name }</a>
		);
	}
}

VCFLink.propTypes = {
  url: PropTypes.string,
  name: PropTypes.string,
  reference: PropTypes.instanceOf(ReferenceGenome),
  updateAndSubmitURL: PropTypes.func
};


class LoadVCFFile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectToReferrer: false,
      fileValidation: null,
      fileHelpMessage: 'Select both the ".vcf.gz" and ".vcf.gz.tbi" files',
      url: '',
      urlValidation: null,
      urlHelpMessage: 'The ".tbi" extension is added to obtain the URL of the index file'
    };

    this.handleFiles = this.handleFiles.bind(this);
    this.handleURLChange = this.handleURLChange.bind(this);
    this.handleURLSubmit = this.handleURLSubmit.bind(this);
    this.updateAndSubmitURL = this.updateAndSubmitURL.bind(this);
  }

	handleFiles(e) {
    try {
      let fileList = e.target.files;
      if (fileList.length < 2) {
        throw new Error("Only 1 file selected. Did you select both the VCF and its index file?");
      } else if (fileList.length > 2) {
        throw new Error("Too many files selected. Only one VCF file can be loaded at a time.");
      }

      let variantFile = new LocalFileReader(fileList.item(0));
      let indexFile   = new LocalFileReader(fileList.item(1));
      if (variantFile.name().endsWith(".tbi") && !indexFile.name().endsWith(".tbi")) {
        [variantFile, indexFile] = [indexFile, variantFile];
      }

      if (!indexFile.name().endsWith(".tbi")) {
        throw new Error('Missing index file. Did you select the VCF file (".vcf.gz") and its index file (".vcf.gz.tbi")?');
      }

      // We won't know if this was a valid source until well after this function returns
      let vcfSource = new VCFSource(new TabixIndexedFile(variantFile, indexFile));

      // Notify application of new source
      this.props.updateSource(vcfSource);
      this.setState({ redirectToReferrer: true });
    } catch (err) {
      this.setState({ fileValidation: 'error', fileHelpMessage: err.message });
    }
	}

	handleURLChange(e) {
		this.setState({ url: e.target.value });
	}


  _createAndUpdateSourceFromURL(variantURL: string, indexURL:string, reference?: ReferenceGenome) {
    try {
      let indexedFile = new TabixIndexedFile(
          new RemoteFileReader(variantURL),
          new RemoteFileReader(indexURL)
          );
      let vcfSource = new VCFSource(indexedFile, reference);

      // Notify application of new source
      this.props.updateSource(vcfSource);
      this.setState({ redirectToReferrer: true });
    } catch(err) {
      this.setState({ urlValidation: 'error', urlHelpMessage: err.message });
    }
  }

  handleURLSubmit(e) {
    e.preventDefault();
    // TODO: Enable index to be set directly, instead of assuming index file can
    // always be found by adding the ".tbi" extension
    let url = this.state.url.trim();
    this._createAndUpdateSourceFromURL(url, url + ".tbi");
  }

  updateAndSubmitURL(url, reference?: ReferenceGenome) {
    this.setState({ url : url });
    this._createAndUpdateSourceFromURL(url, url + ".tbi", reference);
  }

	render(): any {
    if (this.state.redirectToReferrer) {
      const { from } = this.props.location.state || { from: { pathname: '/' } }
      return (
        <Redirect to={from}/>
      )
    }

    return (
      <Modal show={true} bsSize="large">
        <Modal.Header>
          <Modal.Title id="modal-title-lg">Get Started by Loading Your Input File in One of Three Ways</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Load variants from a local file on this computer</h4>
          <Form horizontal>
            <FormGroup validationState={this.state.fileValidation}>
              <Col componentClass={ControlLabel} sm={2}>
                Local VCF file
              </Col>
              <Col sm={10}>
                <FormControl type="file" multiple onChange={this.handleFiles} />
                <HelpBlock>{this.state.fileHelpMessage}</HelpBlock>
              </Col>
            </FormGroup>
          </Form>
          <h4><span>Or</span> load variants from a remote file</h4>
          <Form horizontal onSubmit={this.handleURLSubmit}>
            <FormGroup validationState={this.state.urlValidation}>
              <Col componentClass={ControlLabel} sm={2}>
                URL of VCF File
              </Col>
              <Col sm={8}>
                <FormControl type="text" placeholder="URL of Tabix-indexed VCF file" value={this.state.url} onChange={this.handleURLChange} />
                <HelpBlock>{this.state.urlHelpMessage}</HelpBlock>
              </Col>
              <Col sm={2}>
                <Button type="submit">Load</Button>
              </Col>
            </FormGroup>
          </Form>
          <h4><span>Or</span> choose one of these public datasets</h4>
          <Row>
            <Col sm={2} className={"text-right"}>
              <strong>
                <VCFLink url={"http://www.cs.middlebury.edu/~mlinderman/myseq/NA12878_GIAB_highconf_CG-IllFB-IllGATKHC-Ion-Solid-10X_CHROM1-X_v3.3_highconf.vcf.gz"} reference={b37Reference} name={"NA12878"} updateAndSubmitURL={this.updateAndSubmitURL} />
              </strong>
            </Col>
            <Col sm={10}>
              Genome-in-a-Bottle high confidence calls for NA12878
            </Col>
          </Row>
          <Row>
            <Col sm={2} className={"text-right"}>
              <strong>Testing</strong>
            </Col>
            <Col sm={10}>
              <VCFLink url={"http://localhost:3000/data/single_sample.vcf.gz"} reference={hg19Reference} name={"single_sample.vcf"} updateAndSubmitURL={this.updateAndSubmitURL} /> {' '}
              <VCFLink url={"http://localhost:3000/data/complex.vcf.gz"} reference={hg19Reference} name={"complex.vcf"} updateAndSubmitURL={this.updateAndSubmitURL} /> {' '}
              <VCFLink url={"http://localhost:3000/data/traits.vcf.gz"} reference={hg19Reference} name={"traits.vcf"} updateAndSubmitURL={this.updateAndSubmitURL} /> {' '}
              <VCFLink url={"http://localhost:3000/data/multi_sample.vcf.gz"} reference={hg19Reference} name={"multi_sample.vcf"} updateAndSubmitURL={this.updateAndSubmitURL} />
            </Col>
          </Row>
        </Modal.Body>
			</Modal>
		);
	}
}

LoadVCFFile.propTypes = {
	updateSource: PropTypes.func
};


export default LoadVCFFile;
