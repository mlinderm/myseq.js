/**
 * @flow
 */

'use strict'

import Q from 'q';
import FS from 'fs';

class AbstractFileReader {
	
	bytes(start: number = 0, length: number = Infinity):Object {
		throw new TypeError("Method bytes is not implemented");
	}

}

function _bufferToArrayBufferSlice(buffer: Buffer, bytes?: number) {
	if (bytes === undefined) {
		bytes = buffer.byteLength
	}
	return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + bytes);
}

class LocalFileReader {
	path : string;
	handle : number;

	constructor(path: string) {
		this.path = path;
		this.handle = FS.openSync(path, 'r');
	}

	bytes(start: number = 0, length: number = Infinity): Q.Promise<ArrayBuffer> {
		var deferred = Q.defer();
		if (start == 0 && length == Infinity) {
			// Read the entire file
			FS.readFile(this.path, (err, buf) => {
				if (err) {
					deferred.reject(new Error(err));
				} else {
					deferred.resolve(_bufferToArrayBufferSlice(buf));
				}
			});
		} else {
			// Read a specified region of the file
			var buffer = new Buffer(length);
			FS.read(this.handle, buffer, 0, length, start, (err, read, buf) => {
				if (err) {
					deferred.reject(new Error(err));
				} else {
					deferred.resolve(_bufferToArrayBufferSlice(buf, read));
				}
			});
		}
		return deferred.promise;
	}
}

module.exports = {
	AbstractFileReader,
	LocalFileReader
}
