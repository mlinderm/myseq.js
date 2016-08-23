/**
 * @flow
 */

'use strict'

import Q from 'q';
import AbstractFileReader from './AbstractFileReader'; 

class LocalFileReader extends AbstractFileReader {
	file : File;
	size : number;

	constructor(file: File) {
		super();
		this.file = file;
		this.size = file.size;
	}

	bytes(start: number = 0, length?: number): Q.Promise<ArrayBuffer> {
		var deferred = Q.defer();
		
		// Read a specified region of the file
		if (length === undefined) {
			length = this.size - start;
		}
		var blob = this.file.slice(start, start+length);
		
		var reader = new FileReader();
		reader.onload = function(event) {
			deferred.resolve(reader.result);
		}
		reader.error = function(event) {
			deferred.reject(reader.error);
		}
		reader.readAsArrayBuffer(blob);

		return deferred.promise;
	}
}

module.exports = {
	LocalFileReader
}
