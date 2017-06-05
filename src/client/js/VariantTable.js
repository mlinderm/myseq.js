/**
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';

class VariantTable extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <table>
                <thead>
                    <tr>
                      <th>Variant</th>
                      <th>Id</th>
                      <th>Phenotype</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.variants.map(variant => (
                        <tr key={variant.toString()}>
                          <td>{variant.toString()}</td>
                          <td> {variant.ids.map(id=>(
                            (id !== ".") ? (
                            <div key={id}><a href={"https://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?searchType=adhoc_search&type=rs&rs=" + id}>
                              {id}
                            </a><div>{" "}</div></div>):<div key={id}>None</div>))}
                          </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ); //TODO make work for list of IDs
    }
}



VariantTable.propTupes = {
    variants: PropTypes.array
};

export default VariantTable;
