/**
 * @flow
 */

'use strict'

import Q from 'q';
import FS from 'fs';
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

module.exports = {
	LocalFileReader
}
