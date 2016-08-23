/**
 * @flow
 */

'use strict'

import Q from 'q';

class AbstractFileReader {
	
	bytes(start: number = 0, length?: number):Q.Promise<ArrayBuffer> {
		throw new TypeError("Method bytes is not implemented");
	}

}

module.exports = AbstractFileReader;
