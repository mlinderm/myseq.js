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
		reader.onerror = function(event) {
			deferred.reject(reader.error);
		}
		reader.readAsArrayBuffer(blob);

		return deferred.promise;
	}
}

// Adapted from https://github.com/hammerlab/pileup.js/blob/master/src/main/RemoteFile.js

class RemoteFileReader extends AbstractFileReader {
	url : string;

	constructor(url: string) {
		super();
		this.url = url;
	}

	bytes(start: number = 0, length?: number): Q.Promise<ArrayBuffer> {
		var xhr = new XMLHttpRequest();
    xhr.open('GET', this.url);
    xhr.responseType = 'arraybuffer';
    
		if (start !== 0 || length !== undefined) {
			// Requesting only a portion of the file
			if (length !== undefined) {
				var stop = start + length - 1; // stop is inclusive
				xhr.setRequestHeader('Range', `bytes=${start}-${stop}`);
			} else {
    		xhr.setRequestHeader('Range', `bytes=${start}-`);
			}
		}

    var deferred = Q.defer();
    xhr.addEventListener('load', function() {
      // Note, we use regular function so 'this' is rebound to xhr
	    if (this.status >= 400) {
        deferred.reject(new Error(`RemoteFileRequest failed with status: ${this.status}`));
      } else {
	      deferred.resolve(this.response);
      }
    });
    xhr.addEventListener('error', function() {
      deferred.reject(new Error(`RemoteFileRequest failed with status: ${this.status}`));
    });
    xhr.send();
    return deferred.promise;
	}	
}

module.exports = {
	LocalFileReader,
	RemoteFileReader
}
