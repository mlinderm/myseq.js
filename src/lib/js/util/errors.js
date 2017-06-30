/**
 * @flow
 */
'use strict';

function ContigNotInIndexError(message) {
  this.name = 'ContigNotInIndexError';
  this.message = message || this.name;
  this.stack = (new Error()).stack;
}
ContigNotInIndexError.prototype = Object.create(Error.prototype);
ContigNotInIndexError.prototype.constructor = ContigNotInIndexError;


export { 
  ContigNotInIndexError 
};
