/*jshint esnext:true*/
/*exported DNSRecord*/
'use strict';

module.exports = window.DNSRecord = (function() {

var DNSCodes = require('./dns-codes');

function DNSRecord(name, recordType, classCode) {
  this.name = name;
  this.recordType = recordType;
  this.classCode = classCode || DNSCodes.CLASS_CODES.IN;
}

DNSRecord.prototype.constructor = DNSRecord;

return DNSRecord;

})();
