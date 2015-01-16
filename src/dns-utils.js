/*jshint esnext:true*/
/*exported DNSUtils*/
'use strict';

module.exports = window.DNSUtils = (function() {

var ByteArray   = require('./byte-array');
var BinaryUtils = require('./binary-utils');

var DNSUtils = {
  byteArrayToName: function(byteArrayOrReader) {
    var byteArray;
    var reader;

    if (byteArrayOrReader instanceof ByteArray) {
      byteArray = byteArrayOrReader;
      reader = byteArray.getReader();
    }

    else {
      reader = byteArrayOrReader;
      byteArray = reader.byteArray;
    }

    var parts = [];
    var partLength;
    while (partLength = reader.getValue()) {
      // TODO: Handle case where we have a pointer to the name
      if (partLength === 0xc0) {
        reader.getValue();
        break;
      }

      parts.push(BinaryUtils.arrayBufferToString(reader.getBytes(partLength)));
    }

    return parts.join('.');
  },

  nameToByteArray: function(name) {
    var byteArray = new ByteArray();
    var parts = name.split('.');
    parts.forEach((part) => {
      var length = part.length;
      byteArray.push(length);
      
      for (var i = 0; i < length; i++) {
        byteArray.push(part.charCodeAt(i));
      }
    });

    byteArray.push(0x00);

    return byteArray;
  },

  valueToFlags: function(value) {
    return {
      QR: (value & 0x8000) >> 15,
      OP: (value & 0x7800) >> 11,
      AA: (value & 0x0400) >> 10,
      TC: (value & 0x0200) >>  9,
      RD: (value & 0x0100) >>  8,
      RA: (value & 0x0080) >>  7,
      UN: (value & 0x0040) >>  6,
      AD: (value & 0x0020) >>  5,
      CD: (value & 0x0010) >>  4,
      RC: (value & 0x000f) >>  0
    };
  },

  flagsToValue: function(flags) {
    var value = 0x0000;

    value = value << 1;
    value += flags.QR & 0x01;

    value = value << 4;
    value += flags.OP & 0x0f;

    value = value << 1;
    value += flags.AA & 0x01;

    value = value << 1;
    value += flags.TC & 0x01;

    value = value << 1;
    value += flags.RD & 0x01;

    value = value << 1;
    value += flags.RA & 0x01;

    value = value << 1;
    value += flags.UN & 0x01;

    value = value << 1;
    value += flags.AD & 0x01;

    value = value << 1;
    value += flags.CD & 0x01;

    value = value << 4;
    value += flags.RC & 0x0f;

    return value;
  }

};

return DNSUtils;

})();
