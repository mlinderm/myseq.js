/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import { Table } from 'react-bootstrap';

import { intersperse } from './util/array';
import VCFVariant from '../../lib/js/io/VCFVariant';


function listOfRSIdLinks(
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

function clinvarLinks(variant: VCFVariant) {
  // TODO: Handle multiple references
  return (
    <a
      href={`http://www.ncbi.nlm.nih.gov/clinvar?term=(${variant.position}%5BBase%20Position%20for%20Assembly%20GRCh37%5D)%20AND%20${variant.contig.slice(3)}%5BChromosome%5D`}
      target="_blank"
    >ClinVar</a>
  );
}

function ucscGenomeBrowserLinks(variant: VCFVariant) {
  const chr = variant.contig;
  const pos = variant.position;
  // TODO: Handle multiple references
  return (
    <a
      href={`http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&highlight=hg19.${chr}%3A${pos}-${pos}&position=${chr}%3A${pos}-${pos}`} //do we want to specify chr
      target="_blank"
    >UCSC Genome Browser</a>
  );
}

function exacLinks(variant: VCFVariant) {
  // TODO: Must be b37
  return (
    <a
      href={`http://exac.broadinstitute.org/variant/${variant.contig}-${variant.position}-${variant.ref}-${variant.alt}`}
      target="_blank"
    >ExAC</a>
  );
}

class VariantRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rowHidden : true,
      myVariantInfo : undefined
    };

    this.handleRowClick = this.handleRowClick.bind(this);
  }

  myVariantInfoSearch(chr, pos, ref, alt) {
    if (!this.state.myVariantInfo) {
      const url = `https://myvariant.info/v1/query?q=chr${chr}%3A${pos}`;
      fetch(url)
        .then(response => response.json())
        .then(data => data.hits
          .map(hit => {
            if (hit._id === `chr${chr}:g.${pos}${ref}>${alt}`) {
              this.setState({myVariantInfo : hit});
            }
          })
        );
    }
  }

  handleRowClick() {
    const variant = this.props.variant;
    this.myVariantInfoSearch(variant.contig.slice(3), variant.position, variant.ref, variant.alt[0]); //if variant.alt length greater than one show not supported
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
          <td>{listOfRSIdLinks(variant.ids)}</td>
          <td>{variant.genotype()}</td>
        </tr>
        {!this.state.rowHidden &&
          <tr>
            <td colSpan="3">
            <div style={{float:"left"}}>
              <ul>
                  <li>{clinvarLinks(variant)}</li>
                  <li>{ucscGenomeBrowserLinks(variant)}</li>
                  <li>{exacLinks(variant)}</li>
                  <li>OMIM: {listOfRSIdLinks(variant.ids, (id) => { return `https://www.omim.org/search/?search=rs${id.slice(2)}`; }, "Insufficient data")}</li>
                  <li>SNPedia: {listOfRSIdLinks(variant.ids, (id) => { return `https://www.snpedia.com/index.php/Rs${id.slice(2)}(${variant.ref};${variant.alt[0]})`; }, "Insufficient data")}</li>
                  <li>dbSNP: {listOfRSIdLinks(variant.ids)}</li>
                  <li><a href="https://www.google.com/" target="_blank">Google TODO</a></li>
                  <li><a href="http://myvariant.info/v1/api/#MyVariant.info-variant-query-service-GET-Variant-query-service" target="_blank">MyVariant.Info TODO</a></li>
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
  variant: PropTypes.instanceOf(VCFVariant).isRequired
};



class VariantTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Table bordered={true}>
        <thead>
          <tr><th>Variant</th><th>Id</th><th>Genotype</th></tr>
        </thead>
        {this.props.variants.map(variant => (
          <VariantRow key={variant.toString()} variant={variant} />
        ))}
      </Table>
    );
  }
}



VariantTable.propTypes = {
  variants: PropTypes.array
};

export default VariantTable;
