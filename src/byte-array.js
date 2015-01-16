/*jshint esnext:true*/
/*exported ByteArray*/
'use strict';

module.exports = window.ByteArray = (function() {

function ByteArray(maxBytesOrData) {
  if (maxBytesOrData instanceof Uint8Array ||
      maxBytesOrData instanceof ArrayBuffer) {
    this._data = new Uint8Array(maxBytesOrData);
    this._buffer = this._data.buffer;
    this._cursor = this._data.length;
    return this;
  }

  this._buffer = new ArrayBuffer(maxBytesOrData || 256);
  this._data = new Uint8Array(this._buffer);
  this._cursor = 0;
}

ByteArray.prototype.constructor = ByteArray;

Object.defineProperty(ByteArray.prototype, 'byteLength', {
  get: function() {
    return this._cursor;
  }
});

Object.defineProperty(ByteArray.prototype, 'buffer', {
  get: function() {
    return this._buffer.slice(0, this._cursor);
  }
});

ByteArray.prototype.push = function(value, byteLength) {
  byteLength = byteLength || 1;

  this.append(valueToUint8Array(value, byteLength));
};

ByteArray.prototype.append = function(bytes) {
  if (bytes instanceof ByteArray) {
    bytes = bytes.buffer;
  }

  if (bytes instanceof ArrayBuffer) {
    bytes = new Uint8Array(bytes);
  }

  for (var i = 0, byteLength = bytes.length; i < byteLength; i++) {
    this._data[this._cursor] = bytes[i];
    this._cursor++;
  }
};

ByteArray.prototype.getReader = function(startByte) {
  var cursor = startByte || 0;

  var getBytes = (byteLength) => {
    if (byteLength === null) {
      return new Uint8Array();
    }

    byteLength = byteLength || 1;

    var endPointer = cursor + byteLength;
    if (endPointer > this.byteLength) {
      return new Uint8Array();
    }

    var uint8Array = new Uint8Array(this._buffer.slice(cursor, endPointer));
    cursor += byteLength;

    return uint8Array;
  };

  var getValue = (byteLength) => {
    var bytes = getBytes(byteLength);
    if (bytes.length === 0) {
      return null;
    }

    return uint8ArrayToValue(bytes);
  };

  var isEOF = () => {
    return cursor >= this.byteLength;
  };

  return {
    getBytes:  getBytes,
    getValue:  getValue,
    isEOF:     isEOF,

    byteArray: this
  };
};

/**
 *  Bit   1-Byte    2-Bytes     3-Bytes     4-Bytes
 *  -----------------------------------------------
 *    0        1        256       65536    16777216
 *    1        2        512      131072    33554432
 *    2        4       1024      262144    67108864
 *    3        8       2048      524288   134217728
 *    4       16       4096     1048576   268435456
 *    5       32       8192     2097152   536870912
 *    6       64      16384     4194304  1073741824
 *    7      128      32768     8388608  2147483648
 *  -----------------------------------------------
 *  Offset     0        255       65535    16777215
 *  Total    255      65535    16777215  4294967295
 */
function valueToUint8Array(value, byteLength) {
  var arrayBuffer = new ArrayBuffer(byteLength);
  var uint8Array = new Uint8Array(arrayBuffer);
  for (var i = byteLength - 1; i >= 0; i--) {
    uint8Array[i] = value & 0xff;
    value = value >> 8;
  }

  return uint8Array;
}

function uint8ArrayToValue(uint8Array) {
  var byteLength = uint8Array.length;
  if (byteLength === 0) {
    return null;
  }

  var value = 0;
  for (var i = 0; i < byteLength; i++) {
    value = value << 8;
    value += uint8Array[i];
  }

  return value;
}

return ByteArray;

})();
