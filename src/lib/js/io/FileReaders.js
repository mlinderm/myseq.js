/**
 * @flow
 */

'use strict'

import Q from 'q';
import FS from 'fs';
import http from 'http';
import URL from 'url';
import AbstractFileReader from './AbstractFileReader'; 

function bufferToArrayBufferSlice(buffer: Buffer, bytes?: number) {
	if (bytes === undefined) {
		bytes = buffer.byteLength
	}
	return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + bytes);
}

class LocalFileReader extends AbstractFileReader {
	handle : number;
	size : number; 

	constructor(path: string) {
		super();
		this.handle = FS.openSync(path, 'r');
		this.size = FS.statSync(path).size;
	}

	bytes(start: number = 0, length?: number): Q.Promise<ArrayBuffer> {
		var deferred = Q.defer();
		
		// Read a specified region of the file
		if (length === undefined) {
			length = this.size - start;
		}
		var buffer = new Buffer(length);
		FS.read(this.handle, buffer, 0, length, start, (err, read, buf) => {
			if (err) {
				deferred.reject(new Error(err));
			} else {
				deferred.resolve(bufferToArrayBufferSlice(buf, read));
			}
		});
		
		return deferred.promise;
	}
}

class RemoteFileReader extends AbstractFileReader {
	url : Object;  // TODO: Set correct flow type

	constructor(url: string) {
		super();
		this.url = URL.parse(url);
	}

	bytes(start: number = 0, length?: number): Q.Promise<ArrayBuffer> {
		var options = {
			protocol: this.url.protocol,
			hostname: this.url.hostname,
  		port: this.url.port,
  		path: this.url.path,
  		method: 'GET',
  	};

		if (start !== 0 || length !== undefined) {
			// Requesting only a portion of the file
			if (length !== undefined) {
				var stop = start + length - 1; // stop is inclusive
				options.headers = {
					'Range': `bytes=${start}-${stop}`
				};
			} else {
    		options.headers = {
					'Range': `bytes=${start}-`
				};
			}
		}

		var deferred = Q.defer();
		var req = http.request(options, function(res) {
    	var data = [];
    	res.on('data', function(chunk) {
				data.push(chunk);
    	}).on('end', function() {
				var buffer = Buffer.concat(data);
        deferred.resolve(bufferToArrayBufferSlice(buffer));
    	});
		});
		req.on('error', (e) => {
  		deferred.reject(new Error(`RemoteFileRequest failed: ${e.message}`));
		});
  	req.end();

		return deferred.promise;
	}	
}

module.exports = {
	LocalFileReader,
	RemoteFileReader
}
