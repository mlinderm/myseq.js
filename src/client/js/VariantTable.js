/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import { Table } from 'react-bootstrap';

//prop is single variant (VCFSource)
class VariantRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rowHidden : true
    }
  }

  getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

  handleRowClick() {
    var text = this.getSelectionText();
    //console.log(text);
    if(text.length === 0) {
      if (this.state.rowHidden === true) {
        this.setState({
          rowHidden : false
        })
      } else {
        this.setState({
          rowHidden : true
        })
      }
    }
  }

  render() {

    var chromosome = String(this.props.variantProp.contig).slice(3);
    var position = this.props.variantProp.position;
    var reference = this.props.variantProp.ref;
    var alternate = this.props.variantProp.alt;
    var rsids = String(this.props.variantProp.ids).slice(2);
    var rsidsForMapping = this.props.variantProp.ids;
    var genotype = this.props.variantProp.gt;
    var variantInfo = this.props.variantProp.variantInfo;
    this.props.variantProp.myVariantInfo(chromosome, position, reference, alternate);
    //console.log(this.props.variantProp.variantInfo);

    return (
      <tbody>
        <tr style={(this.state.rowHidden === true) ?
                  {backgroundColor:"#ffffff"} : {backgroundColor:"#D6F1F3"}
                  }>
          <td onClick={()=>this.handleRowClick()}>{this.props.variantProp.toString()}</td>
          <td>
            {rsidsForMapping.map(id=>(
              (id !== ".") ? (
                <div key={id}>
                  <a
                  href={"https://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?searchType=adhoc_search&type=rs&rs=" + id}
                  target="_blank"
                  >
                    {id}
                  </a>
                  <br/>
                </div>) :
                <div key={id}>
                None
                </div>))}
          </td>
          <td onClick={()=>this.handleRowClick()}>{genotype}</td>
        </tr>
        {(this.state.rowHidden === false) ?
          <tr>
            <td colSpan="3">
              <div style={{float:"left"}}>
                <ul>

                  <li><a href={`http://www.ncbi.nlm.nih.gov/clinvar?term=%28%28%28${position}%5BBase%20Position%20for%20Assembly%20GRCh37%5D%29%20AND%20${chromosome}%5BChromosome%5D%29%29`} target="_blank">ClinVar</a></li>
                  <li><a href={`http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&highlight=hg19.chr${chromosome}%3A${position}-${position}&position=chr${chromosome}%3A${position}-${position}`} target="_blank">UCSC</a></li>
                  <li><a href={`http://exac.broadinstitute.org/variant/${chromosome}-${position}-${reference}-${alternate}`} target="_blank">ExAC</a></li>

                  <li>
                    OMiM:<ul style={{display:"inline", padding:4}}>{rsidsForMapping.map(id=>(
                      (id !== ".") ? (
                        <li style={{display:"inline"}} key={id}>
                        <a
                        href={`https://www.omim.org/search/?search=rs${id.slice(2)}`}
                        target="_blank"
                        key={id}
                        >
                          {id}
                        </a>&nbsp;</li>) :
                        <li style={{display:"inline"}} key={id}>
                        None
                        </li>))}</ul>
                  </li>

                  <li>
                    SNPedia:<ul style={{display:"inline", padding:4}}>{rsidsForMapping.map(id=>(
                      (id !== ".") ? (
                        <li style={{display:"inline"}} key={id}>
                        <a
                        href={`https://www.snpedia.com/index.php/Rs${id.slice(2)}(${reference};${alternate})`}
                        target="_blank"
                        key={id}
                        >
                          {id}
                        </a>&nbsp;</li>) :
                        <li style={{display:"inline"}} key={id}>
                        None
                        </li>))}</ul>
                  </li>

                  <li>
                    dbSNP:<ul style={{display:"inline", padding:4}}>{rsidsForMapping.map(id=>(
                      (id !== ".") ? (
                        <li style={{display:"inline"}} key={id}>
                        <a
                        href={`https://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?searchType=adhoc_search&type=rs&rs=${id.slice(2)}`}
                        target="_blank"
                        key={id}
                        >
                          {id}
                        </a>&nbsp;</li>) :
                        <li style={{display:"inline"}} key={id}>
                        None
                        </li>))}</ul>
                  </li>

                  <li><a href="https://www.google.com/" target="_blank">Google TODO</a></li>
                  <li><a href="http://myvariant.info/v1/api/#MyVariant.info-variant-query-service-GET-Variant-query-service" target="_blank">MyVariant.Info TODO</a></li>
                </ul>
              </div>
              <div style={{float:"right", margin:"0 1.5%"}}>
                Inbreeding Coefficient: {(variantInfo != null) ? variantInfo.exac_nontcga.inbreedingcoeff : "N/A"}
              </div>
            </td>

          </tr>
          : <tr></tr>
        }
      </tbody>
    )
  }
}

/* old entries and debug tools
<li>{`rsid: ${rsids}`}</li>
<li>{`chr: ${chromosome}`}</li>
<li>{`position: ${position}`}</li>
<li>ref and alt: {reference} {alternate}</li>


<li>
  <a
    href={`https://www.snpedia.com/index.php/Rs${rsids}(${reference};${alternate})`}
    target="_blank"
  >
    SNPedia single rsid
  </a>
</li>

<li>
  <a
    href={`https://www.omim.org/entry/117800?search=rs${rsids}` }
    target="_blank"
  >
    OMiM single rsid
  </a>
</li>

*/

//props are variant (VCF source)
class VariantTable extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Table bordered={true}>
                <thead>
                    <tr>
                      <th>Variant</th>
                      <th>Id</th>
                      <th>Genotype</th>
                    </tr>
                </thead>
                {this.props.variants.map(variant => (
                <VariantRow variantProp={variant} key={variant.toString()}/>
                ))}
            </Table>
        );
    }
}



VariantTable.propTypes = {
    variants: PropTypes.array
};

export default VariantTable;
