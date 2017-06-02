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
                    <tr><th>Variant</th></tr>
                </thead>
                <tbody>
                    {this.props.variants.map(variant => (
                        <tr key={variant.toString()}><td>{variant.toString()}</td></tr>
                    ))}
                </tbody>
            </table>
        );
    }
}


VariantTable.propTupes = {
    variants: PropTypes.array
};

export default VariantTable;
