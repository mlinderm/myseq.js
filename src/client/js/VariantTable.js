/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import { Table } from 'react-bootstrap';

import { intersperse } from './util/array';
import VCFVariant from '../../lib/js/io/VCFVariant';
import VCFSource from '../../lib/js/io/VCFSource';

class VariantRow extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      rowHidden : true,
      myVariantInfo : undefined
    };

    this.handleRowClick = this.handleRowClick.bind(this);
  }

  listOfRSIdLinks(
    ids: Array<string>,
    urlFn = ((rsId) => { return `https://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?searchType=adhoc_search&type=rs&rs=${rsId.substring(2)}`; }),
    empty = null
  ) {
    let links = ids.map(id => {
      if (id.startsWith("rs")) {
        return (
          <a key={id} href={urlFn(id)} target="_blank">{id}</a>
        );
      } else {
        return id;
      }
    });

    return (links.length > 0) ? intersperse(links, ", ") : empty;
  }

  clinvarLinks(variant: VCFVariant) {
    // TODO: Handle multiple references

    if (this.props.referenceGenome === "hg19" || this.props.referenceGenome === "b37") {
      return (
        <a
          href={`http://www.ncbi.nlm.nih.gov/clinvar?term=(${variant.position}%5BBase%20Position%20for%20Assembly%20GRCh37%5D)%20AND%20${variant.contig.slice(3)}%5BChromosome%5D`}
          target="_blank"
        >ClinVar</a>
      );
    } else if (this.props.referenceGenome === "hg38") { //TODO: verify that this is the right URL
      return (
        <a
          href={`http://www.ncbi.nlm.nih.gov/clinvar?term=(${variant.position}%5BBase%20Position%5D)%20AND%20${variant.contig.slice(3)}%5BChromosome%5D`}
          target="_blank"
        >ClinVar</a>
      );
    }
  }

  ucscGenomeBrowserLinks(variant: VCFVariant) {
    // TODO: Handle multiple references
    const chr = variant.contig;
    const pos = variant.position;

    if (this.props.referenceGenome === "hg19" || this.props.referenceGenome === "b37") {
      var genome = "hg19"; //must use var here let and const do not scope correctly
    } else if (this.props.referenceGenome === "hg38") {
      var genome = "hg38"; //must use var here let and const do not scope correctly
    }
    return (
      <a
        href={`http://genome.ucsc.edu/cgi-bin/hgTracks?db=${genome}&highlight=${genome}.${chr}%3A${pos}-${pos}&position=${chr}%3A${pos}-${pos}`} //do we want to specify chr
        target="_blank"
      >UCSC Genome Browser</a>
    );
  }

  exacLinks(variant: VCFVariant) {
    // TODO: Must be b37
    if (this.props.referenceGenome === 'b37') {
      return (
        <a
          href={`http://exac.broadinstitute.org/variant/${variant.contig}-${variant.position}-${variant.ref}-${variant.alt}`}
          target="_blank"
        >ExAC</a>
      );
    } else {
      return (
        <div>ExAC only supports b37.</div>
      )
    }
  }

  myVariantInfoLinks(variant: VCFVariant) {
    if (this.props.referenceGenome === "hg19" || this.props.referenceGenome === "b37") {
      return (
        <a
          href={`https://myvariant.info/v1/query?q=${variant.ids[0]}`}
          target="_blank"
        >MyVariant.info</a>
      );
    } else {
        return (
          <div>MyVariant.info only supports hg19.</div>
        )
    }
  }

  myVariantInfoSearch(chr, pos, ref, alt, rsID) {
    if (this.props.referenceGenome === "hg19" || this.props.referenceGenome === "b37") {
      if (this.state.myVariantInfo === undefined) {
        //should we use annotation services or a filtered search
        const url = `https://myvariant.info/v1/query?q=${rsID}`;
        // const url = `https://myvariant.info/v1/query?q=chr${chr}%3A${pos}`;
        // const url = `https://myvariant.info/v1/variant/chr${chr}%3Ag.${pos}${ref}%3E${alt}`

        fetch(url)
          .then(response => response.json())
          .then(data => {
            if (data.hits !== undefined) {
              data.hits.map(hit => {
                if (hit._id === `chr${chr}:g.${pos}${ref}>${alt}`) {
                  this.setState({myVariantInfo : hit});
                }
              })
            }
          });
      }
    } else {
      console.log("MyVariant.info annotation only available for reference genome hg19.")
    }
  }

  handleRowClick() {
    const variant = this.props.variant;
    this.myVariantInfoSearch(variant.contig.slice(3), variant.position, variant.ref, variant.alt[0], variant.ids[0]); //if variant.alt or variant.ids length greater than one show not supported
    this.setState({ rowHidden : !this.state.rowHidden });
  }

  render() {
    const variant = this.props.variant;
    // This doesn't work on Safari
    // console.log(variant.contig.slice(3), variant.position, variant.ref, variant.alt[0], variant.alt); //if variant.alt length greater than one show not supported

    // Note, creating multiple tbody elements
    return (
      <tbody>
        <tr style={(this.state.rowHidden) ? {backgroundColor:"#ffffff"} : {backgroundColor:"#D6F1F3"} }>
          <td onClick={this.handleRowClick}>{variant.toString()}</td>
          <td>{this.listOfRSIdLinks(variant.ids)}</td>
          <td>{variant.genotype()}</td>
        </tr>
        {!this.state.rowHidden &&
          <tr>
            <td colSpan="3">
            <div style={{float:"left"}}>
              <ul>
                  <li>{this.clinvarLinks(variant)}</li>
                  <li>{this.ucscGenomeBrowserLinks(variant)}</li>
                  <li>{this.exacLinks(variant)}</li>
                  <li>OMIM: {this.listOfRSIdLinks(variant.ids, (id) => { return `https://www.omim.org/search/?search=rs${id.slice(2)}`; }, "Insufficient data")}</li>
                  <li>SNPedia: {this.listOfRSIdLinks(variant.ids, (id) => { return `https://www.snpedia.com/index.php/Rs${id.slice(2)}(${variant.ref};${variant.alt[0]})`; }, "Insufficient data")}</li>
                  <li>dbSNP: {this.listOfRSIdLinks(variant.ids)}</li>
                  <li>{this.myVariantInfoLinks(variant)}</li>
                  <li><a href="https://www.google.com/" target="_blank">Google TODO</a></li>
              </ul>
            </div>
            <div style={{float:"right"}}>
              Inbreeding Coefficient: {(this.state.myVariantInfo) && (this.state.myVariantInfo.exac_nontcga) ? this.state.myVariantInfo.exac_nontcga.inbreedingcoeff : "Insufficient data"}
            </div>
            </td>
          </tr>
        }
      </tbody>
    );
  }
}



VariantRow.propTypes = {
  variant: PropTypes.instanceOf(VCFVariant).isRequired,
  genome: PropTypes.string,
  referenceGenome: PropTypes.string
};



class VariantTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    //console.log(variant);
    return (
      <Table bordered={true}>
        <thead>
          <tr><th>Variant</th><th>Id</th><th>Genotype</th></tr>
        </thead>
        {this.props.variants.map(variant => (
          <VariantRow key={variant.toString()} variant={variant} referenceGenome={this.props.referenceGenome}/>
        ))}
      </Table>
    );
  }
}



VariantTable.propTypes = {
  variants: PropTypes.array,
  referenceGenome: PropTypes.string
};

export default VariantTable;
