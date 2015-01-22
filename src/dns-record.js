/*jshint esnext:true*/
/*exported DNSRecord*/
'use strict';

module.exports = window.DNSRecord = (function() {

var DNSCodes  = require('./dns-codes');
var DNSUtils  = require('./dns-utils');

var ByteArray = require('./byte-array');

function DNSRecord(properties) {
  if (properties) {
    for (var property in properties) {
      this[property] = properties[property];
    }
  }

  this.name       = this.name       || '';
  this.recordType = this.recordType || DNSCodes.RECORD_TYPES.ANY;
  this.classCode  = this.classCode  || DNSCodes.CLASS_CODES.IN;
}

DNSRecord.parseFromPacketReader = function(reader) {
  var name       = DNSUtils.byteArrayReaderToLabel(reader);
  var recordType = reader.getValue(2);
  var classCode  = reader.getValue(2);

  return new this({
    name: DNSUtils.decompressLabel(name, reader.byteArray),
    recordType: recordType,
    classCode: classCode
  });
};

DNSRecord.prototype.constructor = DNSRecord;

DNSRecord.prototype.serialize = function() {
  var byteArray = new ByteArray();
  
  // Write `name` (ends with trailing 0x00 byte)
  byteArray.append(DNSUtils.labelToByteArray(this.name));
  byteArray.push(0x00);
  
  // Write `recordType` (2 bytes)
  byteArray.push(this.recordType, 2);

  // Write `classCode` (2 bytes)
  byteArray.push(this.classCode, 2);

  return byteArray;
};

return DNSRecord;

})();
