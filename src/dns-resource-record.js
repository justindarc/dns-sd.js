/*jshint esnext:true*/
/*exported DNSResourceRecord*/
'use strict';

module.exports = window.DNSResourceRecord = (function() {

var DNSRecord   = require('./dns-record');
var DNSCodes    = require('./dns-codes');
var DNSUtils    = require('./dns-utils');

const DNS_RESOURCE_RECORD_DEFAULT_TTL = 10; // 10 seconds
// const DNS_RESOURCE_RECORD_DEFAULT_TTL = 3600; // 1 hour

function DNSResourceRecord(name, recordType, classCode, ttl, data) {
  this.name = name;
  this.recordType = recordType;
  this.classCode = classCode || DNSCodes.CLASS_CODES.IN;
  this.ttl = ttl || DNS_RESOURCE_RECORD_DEFAULT_TTL;
  this.data = data;
}

DNSResourceRecord.prototype = Object.create(DNSRecord.prototype);

DNSResourceRecord.prototype.constructor = DNSResourceRecord;

DNSResourceRecord.prototype.getName = function() {
  return DNSUtils.byteArrayToName(new ByteArray(this.data));
};

return DNSResourceRecord;

})();
