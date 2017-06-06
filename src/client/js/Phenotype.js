import React from 'react';
import PropTypes from 'prop-types';

import { LocalFileReader, RemoteFileReader } from '../../lib/js/io/FileReaders-browser';
import TabixIndexedFile from '../../lib/js/io/TabixIndexedFile';
import VCFSource from '../../lib/js/io/VCFSource';

var Traits = {
  testBitter: {
    name: "Taste Bitter",
    chr: 7,
    pos: 141973545,
    gt: "C/C"
    }
  };

class PhenotypeTable extends React.Component { //generalize for list of traits
  render() {
      var testList = [2,3]

      return (
          <table>
              <thead>
                  <tr>
                    <th>Genotype</th>
                    <th>Phenotype</th>
                    <th>Boolean</th>
                  </tr>
              </thead>
              <tbody>
                      <tr style={(testList.indexOf(1) === -1) ?
                          {color:"#d0021b"} : {color:"#000000"}}>
                        <td>{Traits.testBitter.gt}</td>
                        <td>{Traits.testBitter.name}</td>
                        <td>{testList.indexOf(1)}</td>
                      </tr>
              </tbody>
          </table>
      );
  }
}

export default PhenotypeTable;
