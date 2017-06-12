import React from 'react';
import PropTypes from 'prop-types';
import Q from 'q';

import { LocalFileReader, RemoteFileReader } from '../../lib/js/io/FileReaders-browser';
import TabixIndexedFile from '../../lib/js/io/TabixIndexedFile';
import VCFSource from '../../lib/js/io/VCFSource';

//single variant phenotype table whos props are variant and association Array
// single then call source.variantbyVAriant().this(variant=>{if (variant.Length) this.setState({currentGT: variant GT})}

var Traits = {

    earwax: {
      variant: { chr: 16, pos: 48258198, ref: "C", alt: "T"},
      association: [
        ["C/C", "Wet earwax"],
        ["C/T", "Wet earwax, better BO"],
        ["T/T", "Dry earwax"]
      ]
    },

    muscles: {
      variant: { chr: 11, pos: 66328095, ref: "T", alt: "C"},
      association: [
        ["C/C", "Better muscles"]
      ]
    },

    asparagus: {
      variant: { chr: 1, pos: 248496863, ref: "T", alt: "C"},
      association: [
        ["A/A", "Pee smells like asparagus"]
      ]
    }

  };

//takes variants as prop
class PhenotypeTable extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      listOfTraits : [],
      presentTraits : [],
      truelyPresent: []
    };
  }

    componentDidMount() {
        var tempTraitList = [];
        var tempPresentList = [];

        var traitVariant;

        for (var key in Traits) {
          Traits[key].association.map(trait => tempTraitList.push(trait.concat([Traits[key].variant])));
          traitVariant = Traits[key].variant;

          for (var element in Traits[key].association) {
            var gene = Traits[key].association[element][0];
            var stringy = Traits[key].association[element][1];

            //testing, still not working for other datasets
            console.log(traitVariant.chr, traitVariant.pos, traitVariant.ref, traitVariant.alt);
            this.props.source.variantByVariantandGT("chr" + traitVariant.chr, traitVariant.pos, traitVariant.ref,
              traitVariant.alt, gene, stringy)[0].then(vart=>console.log(vart.genotype()));

            tempPresentList.push(this.props.source.variantByVariantandGT("chr" + traitVariant.chr, traitVariant.pos, traitVariant.ref,
              traitVariant.alt, gene, stringy)[0])
          };
        };
        //console.log(tempPresentList);

        Q.all(tempPresentList)
        .then(variant=>{ console.log(variant);
                         variant.filter(vars=>(vars.length > 0))
        .map(v=>{ console.log(v);
                  var temp = this.state.presentTraits;
                  temp.push(v[0]);
                  this.setState({ presentTraits:temp });
                  for (var i in temp) {
                    console.log(temp[i]);
                    for (var j in tempTraitList){
                      if(temp[i].position === tempTraitList[j][2].pos && temp[i].genotype() === tempTraitList[j][0]) {
                        tempTraitList[j].push("present");
                        this.setState({ listOfTraits:tempTraitList });
                        //console.log(this.state.listOfTraits);
                      }
                    }
                  }
                }
            )           }
          ,console.log("FAIL"));

        this.setState({ listOfTraits:tempTraitList });
    }

  render() {
      return (
          <table>
              <thead>
                  <tr>
                    <th>Genotype</th>
                    <th>Phenotype</th>
                  </tr>
              </thead>
              <tbody>
                {this.state.listOfTraits.map(list =>
                <tr style={(list.length === 4) ?
                          {color:"#d0021b"} : {color:"#000000"}
                          }
                    key={list[1]}>
                  <td>{list[0]}</td>
                  <td>{list[1]}</td>
                </tr>
              )}
              </tbody>
          </table>
      );
  }
}

export default PhenotypeTable;
