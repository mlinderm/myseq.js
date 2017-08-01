/**
 * @flow
 */

'use strict';

import _ from 'underscore';

class ReferenceGenome {
  shortName : string;
  leadingChr : boolean;
  _seqDict : Object;
  _liftoverTo : Object;

  constructor(shortName: string, leadingChr: boolean, seqDict: Object, liftoverTo) {
    // Not currently supported in Babel: https://github.com/babel/babel/issues/1088
    // if (new.target === ReferenceGenome) {
    //    throw new Error("Cannot construct ReferenceGenome instances directly");
    // }

    this.shortName = shortName;
    this.leadingChr = leadingChr;
    this._seqDict = seqDict;
    this._liftoverTo = liftoverTo;
  }

  normalizeContig(contig: string) {
    if (this._seqDict.hasOwnProperty(contig))
      return contig;
    else {
      // Translate contigs from other references to this reference
      let lifted = this._liftoverTo[contig];
      if (lifted === undefined) {
        throw new RangeError('Unknown contig: ' + contig);
      }
      return lifted;
    }
  }
  
  contigs(): Array<string> {
    return Object.keys(this._seqDict);
  }
}

const hg19SeqDict = {
    chrM: { LN:16571, M5: "d2ed829b8a1628d16cbeee88e88e39eb" },
    chr1: { LN:249250621, M5: "1b22b98cdeb4a9304cb5d48026a85128" },
    chr2: { LN:243199373, M5: "a0d9851da00400dec1098a9255ac712e" },
    chr3: { LN:198022430, M5: "641e4338fa8d52a5b781bd2a2c08d3c3" },
    chr4: { LN:191154276, M5: "23dccd106897542ad87d2765d28a19a1" },
    chr5: { LN:180915260, M5: "0740173db9ffd264d728f32784845cd7" },
    chr6: { LN:171115067, M5: "1d3a93a248d92a729ee764823acbbc6b" },
    chr7: { LN:159138663, M5: "618366e953d6aaad97dbe4777c29375e" },
    chr8: { LN:146364022, M5: "96f514a9929e410c6651697bded59aec" },
    chr9: { LN:141213431, M5: "3e273117f15e0a400f01055d9f393768" },
    chr10: { LN:135534747, M5: "988c28e000e84c26d552359af1ea2e1d" },
    chr11: { LN:135006516, M5: "98c59049a2df285c76ffb1c6db8f8b96" },
    chr12: { LN:133851895, M5: "51851ac0e1a115847ad36449b0015864" },
    chr13: { LN:115169878, M5: "283f8d7892baa81b510a015719ca7b0b" },
    chr14: { LN:107349540, M5: "98f3cae32b2a2e9524bc19813927542e" },
    chr15: { LN:102531392, M5: "e5645a794a8238215b2cd77acb95a078" },
    chr16: { LN:90354753, M5: "fc9b1a7b42b97a864f56b348b06095e6" },
    chr17: { LN:81195210, M5: "351f64d4f4f9ddd45b35336ad97aa6de" },
    chr18: { LN:78077248, M5: "b15d4b2d29dde9d3e4f93d1d0f2cbc9c" },
    chr19: { LN:59128983, M5: "1aacd71f30db8e561810913e0b72636d" },
    chr20: { LN:63025520, M5: "0dec9660ec1efaaf33281c0d5ea2560f" },
    chr21: { LN:48129895, M5: "2979a6085bfe28e3ad6f552f361ed74d" },
    chr22: { LN:51304566, M5: "a718acaa6135fdca8357d5bfe94211dd" },
    chrX: { LN:155270560, M5: "7e0e2e580297b7764e31dbc80c2540dd" },
    chrY: { LN:59373566, M5: "1e86411d73e6f00a10590f976be01623" },
    chr1_gl000191_random: {	LN:106433, M5: "d75b436f50a8214ee9c2a51d30b2c2cc" },
    chr1_gl000192_random: {	LN:547496, M5: "325ba9e808f669dfeee210fdd7b470ac" },
    chr4_ctg9_hap1: { LN:590426, M5: "fa24f81b680df26bcfb6d69b784fbe36" },
    chr4_gl000193_random: {	LN:189789, M5: "dbb6e8ece0b5de29da56601613007c2a" },
    chr4_gl000194_random: {	LN:191469, M5: "6ac8f815bf8e845bb3031b73f812c012" },
    chr6_apd_hap1: { LN:4622290, M5: "fe71bc63420d666884f37a3ad79f3317" },
    chr6_cox_hap2: { LN:4795371, M5: "18c17e1641ef04873b15f40f6c8659a4" },
    chr6_dbb_hap3: { LN:4610396, M5: "2a3c677c426a10e137883ae1ffb8da3f" },
    chr6_mann_hap4: { LN:4683263, M5: "9d51d4152174461cd6715c7ddc588dc8" },
    chr6_mcf_hap5: { LN:4833398, M5: "efed415dd8742349cb7aaca054675b9a" },
    chr6_qbl_hap6: { LN:4611984, M5: "094d037050cad692b57ea12c4fef790f" },
    chr6_ssto_hap7: { LN:4928567, M5: "3b6d666200e72bcc036bf88a4d7e0749" },
    chr7_gl000195_random: {	LN:182896, M5: "5d9ec007868d517e73543b005ba48535" },
    chr8_gl000196_random: {	LN:38914, M5: "d92206d1bb4c3b4019c43c0875c06dc0" },
    chr8_gl000197_random: {	LN:37175, M5: "6f5efdd36643a9b8c8ccad6f2f1edc7b" },
    chr9_gl000198_random: {	LN:90085, M5: "868e7784040da90d900d2d1b667a1383" },
    chr9_gl000199_random: {	LN:169874, M5: "569af3b73522fab4b40995ae4944e78e" },
    chr9_gl000200_random: {	LN:187035, M5: "75e4c8d17cd4addf3917d1703cacaf25" },
    chr9_gl000201_random: {	LN:36148, M5: "dfb7e7ec60ffdcb85cb359ea28454ee9" },
    chr11_gl000202_random: { LN:40103, M5: "06cbf126247d89664a4faebad130fe9c" },
    chr17_ctg5_hap1: { LN:1680828, M5: "d89517b400226d3b56e753972a7cad67" },
    chr17_gl000203_random: { LN:37498, M5: "96358c325fe0e70bee73436e8bb14dbd" },
    chr17_gl000204_random: { LN:81310, M5: "efc49c871536fa8d79cb0a06fa739722" },
    chr17_gl000205_random: { LN:174588, M5: "d22441398d99caf673e9afb9a1908ec5" },
    chr17_gl000206_random: { LN:41001, M5: "43f69e423533e948bfae5ce1d45bd3f1" },
    chr18_gl000207_random: { LN:4262, M5: "f3814841f1939d3ca19072d9e89f3fd7" },
    chr19_gl000208_random: { LN:92689, M5: "aa81be49bf3fe63a79bdc6a6f279abf6" },
    chr19_gl000209_random: { LN:159169, M5: "f40598e2a5a6b26e84a3775e0d1e2c81" },
    chr21_gl000210_random: { LN:27682, M5: "851106a74238044126131ce2a8e5847c" },
    chrUn_gl000211: { LN:166566, M5:"7daaa45c66b288847b9b32b964e623d3" },
    chrUn_gl000212: { LN:186858, M5:"563531689f3dbd691331fd6c5730a88b" },
    chrUn_gl000213: { LN:164239, M5:"9d424fdcc98866650b58f004080a992a" },
    chrUn_gl000214: { LN:137718, M5:"46c2032c37f2ed899eb41c0473319a69" },
    chrUn_gl000215: { LN:172545, M5:"5eb3b418480ae67a997957c909375a73" },
    chrUn_gl000216: { LN:172294, M5:"642a232d91c486ac339263820aef7fe0" },
    chrUn_gl000217: { LN:172149, M5:"6d243e18dea1945fb7f2517615b8f52e" },
    chrUn_gl000218: { LN:161147, M5:"1d708b54644c26c7e01c2dad5426d38c" },
    chrUn_gl000219: { LN:179198, M5:"f977edd13bac459cb2ed4a5457dba1b3" },
    chrUn_gl000220: { LN:161802, M5:"fc35de963c57bf7648429e6454f1c9db" },
    chrUn_gl000221: { LN:155397, M5:"3238fb74ea87ae857f9c7508d315babb" },
    chrUn_gl000222: { LN:186861, M5:"6fe9abac455169f50470f5a6b01d0f59" },
    chrUn_gl000223: { LN:180455, M5:"399dfa03bf32022ab52a846f7ca35b30" },
    chrUn_gl000224: { LN:179693, M5:"d5b2fc04f6b41b212a4198a07f450e20" },
    chrUn_gl000225: { LN:211173, M5:"63945c3e6962f28ffd469719a747e73c" },
    chrUn_gl000226: { LN:15008, M5:"1c1b2cd1fccbc0a99b6a447fa24d1504" },
    chrUn_gl000227: { LN:128374, M5:"a4aead23f8053f2655e468bcc6ecdceb" },
    chrUn_gl000228: { LN:129120, M5:"c5a17c97e2c1a0b6a9cc5a6b064b714f" },
    chrUn_gl000229: { LN:19913, M5:"d0f40ec87de311d8e715b52e4c7062e1" },
    chrUn_gl000230: { LN:43691, M5:"b4eb71ee878d3706246b7c1dbef69299" },
    chrUn_gl000231: { LN:27386, M5:"ba8882ce3a1efa2080e5d29b956568a4" },
    chrUn_gl000232: { LN:40652, M5:"3e06b6741061ad93a8587531307057d8" },
    chrUn_gl000233: { LN:45941, M5:"7fed60298a8d62ff808b74b6ce820001" },
    chrUn_gl000234: { LN:40531, M5:"93f998536b61a56fd0ff47322a911d4b" },
    chrUn_gl000235: { LN:34474, M5:"118a25ca210cfbcdfb6c2ebb249f9680" },
    chrUn_gl000236: { LN:41934, M5:"fdcd739913efa1fdc64b6c0cd7016779" },
    chrUn_gl000237: { LN:45867, M5:"e0c82e7751df73f4f6d0ed30cdc853c0" },
    chrUn_gl000238: { LN:39939, M5:"131b1efc3270cc838686b54e7c34b17b" },
    chrUn_gl000239: { LN:33824, M5:"99795f15702caec4fa1c4e15f8a29c07" },
    chrUn_gl000240: { LN:41933, M5:"445a86173da9f237d7bcf41c6cb8cc62" },
    chrUn_gl000241: { LN:42152, M5:"ef4258cdc5a45c206cea8fc3e1d858cf" },
    chrUn_gl000242: { LN:43523, M5:"2f8694fc47576bc81b5fe9e7de0ba49e" },
    chrUn_gl000243: { LN:43341, M5:"cc34279a7e353136741c9fce79bc4396" },
    chrUn_gl000244: { LN:39929, M5:"0996b4475f353ca98bacb756ac479140" },
    chrUn_gl000245: { LN:36651, M5:"89bc61960f37d94abf0df2d481ada0ec" },
    chrUn_gl000246: { LN:38154, M5:"e4afcd31912af9d9c2546acf1cb23af2" },
    chrUn_gl000247: { LN:36422, M5:"7de00226bb7df1c57276ca6baabafd15" },
    chrUn_gl000248: { LN:39786, M5:"5a8e43bec9be36c7b49c84d585107776" },
    chrUn_gl000249: { LN:38502, M5:"1d78abec37c15fe29a275eb08d5af236" }
};

const liftToHg19 = {
    MT: "chrM",
    '1': "chr1",
    '2': "chr2",
    '3': "chr3",
    '4': "chr4",
    '5': "chr5",
    '6': "chr6",
    '7': "chr7",
    '8': "chr8",
    '9': "chr9",
    '10': "chr10",
    '11': "chr11",
    '12': "chr12",
    '13': "chr13",
    '14': "chr14",
    '15': "chr15",
    '16': "chr16",
    '17': "chr17",
    '18': "chr18",
    '19': "chr19",
    '20': "chr20",
    '21': "chr21",
    '22': "chr22",
    X: "chrX",
    Y: "chrY"
};


class Hg19Reference extends ReferenceGenome {
  constructor() {
    super("hg19", true, hg19SeqDict, liftToHg19);
  }
}

const b37SeqDict = {
    "1": { LN:249250621, M5: "1b22b98cdeb4a9304cb5d48026a85128" },
    "2": { LN:243199373, M5: "a0d9851da00400dec1098a9255ac712e" },
    "3": { LN:198022430, M5: "fdfd811849cc2fadebc929bb925902e5" },
    "4": { LN:191154276, M5: "23dccd106897542ad87d2765d28a19a1" },
    "5": { LN:180915260, M5: "0740173db9ffd264d728f32784845cd7" },
    "6": { LN:171115067, M5: "1d3a93a248d92a729ee764823acbbc6b" },
    "7": { LN:159138663, M5: "618366e953d6aaad97dbe4777c29375e" },
    "8": { LN:146364022, M5: "96f514a9929e410c6651697bded59aec" },
    "9": { LN:141213431, M5: "3e273117f15e0a400f01055d9f393768" },
    "10": { LN:135534747, M5: "988c28e000e84c26d552359af1ea2e1d" },
    "11": { LN:135006516, M5: "98c59049a2df285c76ffb1c6db8f8b96" },
    "12": { LN:133851895, M5: "51851ac0e1a115847ad36449b0015864" },
    "13": { LN:115169878, M5: "283f8d7892baa81b510a015719ca7b0b" },
    "14": { LN:107349540, M5: "98f3cae32b2a2e9524bc19813927542e" },
    "15": { LN:102531392, M5: "e5645a794a8238215b2cd77acb95a078" },
    "16": { LN:90354753, M5: "fc9b1a7b42b97a864f56b348b06095e6" },
    "17": { LN:81195210, M5: "351f64d4f4f9ddd45b35336ad97aa6de" },
    "18": { LN:78077248, M5: "b15d4b2d29dde9d3e4f93d1d0f2cbc9c" },
    "19": { LN:59128983, M5: "1aacd71f30db8e561810913e0b72636d" },
    "20": { LN:63025520, M5: "0dec9660ec1efaaf33281c0d5ea2560f" },
    "21": { LN:48129895, M5: "2979a6085bfe28e3ad6f552f361ed74d" },
    "22": { LN:51304566, M5: "a718acaa6135fdca8357d5bfe94211dd" },
    "X": { LN:155270560, M5: "7e0e2e580297b7764e31dbc80c2540dd" },
    "Y": { LN:59373566, M5: "1fa3474750af0948bdf97d5a0ee52e51" },
    "MT": { LN:16569, M5: "c68f52674c9fb33aef52dcf399755519" },
    "GL000207.1": { LN:4262, M5: "f3814841f1939d3ca19072d9e89f3fd7" },
    "GL000226.1": { LN:15008, M5: "1c1b2cd1fccbc0a99b6a447fa24d1504" },
    "GL000229.1": { LN:19913, M5: "d0f40ec87de311d8e715b52e4c7062e1" },
    "GL000231.1": { LN:27386, M5: "ba8882ce3a1efa2080e5d29b956568a4" },
    "GL000210.1": { LN:27682, M5: "851106a74238044126131ce2a8e5847c" },
    "GL000239.1": { LN:33824, M5: "99795f15702caec4fa1c4e15f8a29c07" },
    "GL000235.1": { LN:34474, M5: "118a25ca210cfbcdfb6c2ebb249f9680" },
    "GL000201.1": { LN:36148, M5: "dfb7e7ec60ffdcb85cb359ea28454ee9" },
    "GL000247.1": { LN:36422, M5: "7de00226bb7df1c57276ca6baabafd15" },
    "GL000245.1": { LN:36651, M5: "89bc61960f37d94abf0df2d481ada0ec" },
    "GL000197.1": { LN:37175, M5: "6f5efdd36643a9b8c8ccad6f2f1edc7b" },
    "GL000203.1": { LN:37498, M5: "96358c325fe0e70bee73436e8bb14dbd" },
    "GL000246.1": { LN:38154, M5: "e4afcd31912af9d9c2546acf1cb23af2" },
    "GL000249.1": { LN:38502, M5: "1d78abec37c15fe29a275eb08d5af236" },
    "GL000196.1": { LN:38914, M5: "d92206d1bb4c3b4019c43c0875c06dc0" },
    "GL000248.1": { LN:39786, M5: "5a8e43bec9be36c7b49c84d585107776" },
    "GL000244.1": { LN:39929, M5: "0996b4475f353ca98bacb756ac479140" },
    "GL000238.1": { LN:39939, M5: "131b1efc3270cc838686b54e7c34b17b" },
    "GL000202.1": { LN:40103, M5: "06cbf126247d89664a4faebad130fe9c" },
    "GL000234.1": { LN:40531, M5: "93f998536b61a56fd0ff47322a911d4b" },
    "GL000232.1": { LN:40652, M5: "3e06b6741061ad93a8587531307057d8" },
    "GL000206.1": { LN:41001, M5: "43f69e423533e948bfae5ce1d45bd3f1" },
    "GL000240.1": { LN:41933, M5: "445a86173da9f237d7bcf41c6cb8cc62" },
    "GL000236.1": { LN:41934, M5: "fdcd739913efa1fdc64b6c0cd7016779" },
    "GL000241.1": { LN:42152, M5: "ef4258cdc5a45c206cea8fc3e1d858cf" },
    "GL000243.1": { LN:43341, M5: "cc34279a7e353136741c9fce79bc4396" },
    "GL000242.1": { LN:43523, M5: "2f8694fc47576bc81b5fe9e7de0ba49e" },
    "GL000230.1": { LN:43691, M5: "b4eb71ee878d3706246b7c1dbef69299" },
    "GL000237.1": { LN:45867, M5: "e0c82e7751df73f4f6d0ed30cdc853c0" },
    "GL000233.1": { LN:45941, M5: "7fed60298a8d62ff808b74b6ce820001" },
    "GL000204.1": { LN:81310, M5: "efc49c871536fa8d79cb0a06fa739722" },
    "GL000198.1": { LN:90085, M5: "868e7784040da90d900d2d1b667a1383" },
    "GL000208.1": { LN:92689, M5: "aa81be49bf3fe63a79bdc6a6f279abf6" },
    "GL000191.1": { LN:106433, M5: "d75b436f50a8214ee9c2a51d30b2c2cc" },
    "GL000227.1": { LN:128374, M5: "a4aead23f8053f2655e468bcc6ecdceb" },
    "GL000228.1": { LN:129120, M5: "c5a17c97e2c1a0b6a9cc5a6b064b714f" },
    "GL000214.1": { LN:137718, M5: "46c2032c37f2ed899eb41c0473319a69" },
    "GL000221.1": { LN:155397, M5: "3238fb74ea87ae857f9c7508d315babb" },
    "GL000209.1": { LN:159169, M5: "f40598e2a5a6b26e84a3775e0d1e2c81" },
    "GL000218.1": { LN:161147, M5: "1d708b54644c26c7e01c2dad5426d38c" },
    "GL000220.1": { LN:161802, M5: "fc35de963c57bf7648429e6454f1c9db" },
    "GL000213.1": { LN:164239, M5: "9d424fdcc98866650b58f004080a992a" },
    "GL000211.1": { LN:166566, M5: "7daaa45c66b288847b9b32b964e623d3" },
    "GL000199.1": { LN:169874, M5: "569af3b73522fab4b40995ae4944e78e" },
    "GL000217.1": { LN:172149, M5: "6d243e18dea1945fb7f2517615b8f52e" },
    "GL000216.1": { LN:172294, M5: "642a232d91c486ac339263820aef7fe0" },
    "GL000215.1": { LN:172545, M5: "5eb3b418480ae67a997957c909375a73" },
    "GL000205.1": { LN:174588, M5: "d22441398d99caf673e9afb9a1908ec5" },
    "GL000219.1": { LN:179198, M5: "f977edd13bac459cb2ed4a5457dba1b3" },
    "GL000224.1": { LN:179693, M5: "d5b2fc04f6b41b212a4198a07f450e20" },
    "GL000223.1": { LN:180455, M5: "399dfa03bf32022ab52a846f7ca35b30" },
    "GL000195.1": { LN:182896, M5: "5d9ec007868d517e73543b005ba48535" },
    "GL000212.1": { LN:186858, M5: "563531689f3dbd691331fd6c5730a88b" },
    "GL000222.1": { LN:186861, M5: "6fe9abac455169f50470f5a6b01d0f59" },
    "GL000200.1": { LN:187035, M5: "75e4c8d17cd4addf3917d1703cacaf25" },
    "GL000193.1": { LN:189789, M5: "dbb6e8ece0b5de29da56601613007c2a" },
    "GL000194.1": { LN:191469, M5: "6ac8f815bf8e845bb3031b73f812c012" },
    "GL000225.1": { LN:211173, M5: "63945c3e6962f28ffd469719a747e73c" },
    "GL000192.1": { LN:547496, M5: "325ba9e808f669dfeee210fdd7b470ac" }
};

const liftToB37 = {
    chrM: "MT",
    chr1: "1",
    chr2: "2",
    chr3: "3",
    chr4: "4",
    chr5: "5",
    chr6: "6",
    chr7: "7",
    chr8: "8",
    chr9: "9",
    chr10: "11",
    chr11: "11",
    chr12: "12",
    chr13: "13",
    chr14: "14",
    chr15: "15",
    chr16: "16",
    chr17: "17",
    chr18: "18",
    chr19: "19",
    chr20: "20",
    chr21: "21",
    chr22: "22",
    chrX: "X",
    chrY: "Y"
};


class B37Reference extends ReferenceGenome {
  constructor() {
    super("b37", false, b37SeqDict, liftToB37);
  }
}


const hg19Reference = new Hg19Reference();
const b37Reference = new B37Reference();

const fileNamesToRef = {
  "human_g1k_v37.fasta": b37Reference,
  "ucsc.hg19.fasta": hg19Reference
};

const references = [
  hg19Reference,
  b37Reference
];

const shortNameToRef = {
  "hg19": hg19Reference,
  "b37": b37Reference
};

module.exports = {
  ReferenceGenome,
  hg19Reference,
  b37Reference,
  referenceFromFile: function(filename: string) {
    return fileNamesToRef[filename.split(/[\\/]/).pop()];
  },
  referenceFromContigs: function(contigs: Array<string>): ReferenceGenome {
    let possibleRefs = references.filter(ref => _.difference(contigs, ref.contigs()).length === 0); 
    // Only return reference if we generate a unique match
    return (possibleRefs.length === 1) ? possibleRefs[0] : undefined;
  },
  referenceFromShortName: function(shortName: string): ReferenceGenome {
    return shortNameToRef[shortName];
  }
};
