/**
 * @flow
 */
'use strict';

import React from 'react';

import { LocalFileReader, RemoteFileReader } from '../../lib/js/io/FileReaders-browser';  
import TabixIndexedFile from '../../lib/js/io/TabixIndexedFile';
import VCFSource from '../../lib/js/io/VCFSource';

class VCFLink extends React.Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(e) {
		e.preventDefault();
		this.props.updateAndSubmitURL(this.props.url);
	}

	render() {
		return (
			<a href="#" onClick={this.handleClick}>{ this.props.name }</a>
		);
	}
}

VCFLink.propTypes = {
	updateAndSubmitURL: React.PropTypes.func
};


class LoadVCFFile extends React.Component {
	constructor(props) {
		super(props);
		this.state = { url: '' };

		this.handleFiles = this.handleFiles.bind(this);
		this.handleURLChange = this.handleURLChange.bind(this);
		this.handleURLSubmit = this.handleURLSubmit.bind(this);
		this.updateAndSubmitURL = this.updateAndSubmitURL.bind(this);
	}

	handleFiles(e) {
		// Create source from FileList object, checking for both vcf and index
		var fileList = e.target.files;
		if (fileList.length < 2) {
			console.log("Show an error: Did you select both the VCF and its index file?");
			return;
		} else if (fileList.length > 2) {
			console.log("Show an error: Only one file can be loaded at a time?");
			return;
		}
		
		var variantFile = new LocalFileReader(fileList.item(0));
		var indexFile   = new LocalFileReader(fileList.item(1));
		if (!indexFile.name().endsWith(".tbi")) {
			[varianFile, indexFile] = [indexFile, variantFile];
		}

		var vcfSource = new VCFSource(
			new TabixIndexedFile(variantFile, indexFile)
		);	
		
		// Notify application of new source
		this.props.updateSource(vcfSource);
	}

	handleURLChange(e) {
		this.setState({ url: e.target.value });
	}

	_createAndUpdateSourceFromURL(variantURL: string, indexURL?:string) {
		if (indexURL === undefined) {
			indexURL = variantURL + ".tbi";
		}
	
		var indexedFile = new TabixIndexedFile(
			new RemoteFileReader(variantURL), 
			new RemoteFileReader(indexURL)
		)	
		var vcfSource = new VCFSource(indexedFile);

		// Notify application of new source
		this.props.updateSource(vcfSource);
	}

	handleURLSubmit(e) {
		e.preventDefault();
		
		// Currently assume index file can be found by adding extension.
		// TODO: Enable index to be set directly
		this._createAndUpdateSourceFromURL(this.state.url.trim());		
	}

	updateAndSubmitURL(url) {
		this.setState({ url : url });
		this._createAndUpdateSourceFromURL(url);
	}

	render(): any {
		return (
			<div>
				<input type="file" multiple="multiple" onChange={this.handleFiles} />
				<p>Or supply a URL (assumes index available at the same URL with ".tbi" extension</p>
				<form onSubmit={this.handleURLSubmit.bind(this)}>
						<input type="text" placeholder="URL of Tabix-indexed VCF file" value={this.state.url} onChange={this.handleURLChange}/>
						<input type="submit" value="Load" />
				</form>
				<p>Or choose some these example datasets:</p>
				<VCFLink url={"http://localhost:3000/data/single_sample.vcf.gz"} name={"single_sample.vcf"} updateAndSubmitURL={this.updateAndSubmitURL} /> 
			</div>
		);
	}
}

LoadVCFFile.propTypes = {
	updateSource: React.PropTypes.func
};


export default LoadVCFFile;
