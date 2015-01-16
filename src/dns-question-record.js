/*jshint esnext:true*/
/*exported DNSQuestionRecord*/
'use strict';

module.exports = window.DNSQuestionRecord = (function() {

var DNSRecord = require('./dns-record');
var DNSCodes  = require('./dns-codes');

function DNSQuestionRecord(name, recordType, classCode) {
  this.name = name;
  this.recordType = recordType;
  this.classCode = classCode || DNSCodes.CLASS_CODES.IN;
}

DNSQuestionRecord.prototype = Object.create(DNSRecord.prototype);

DNSQuestionRecord.prototype.constructor = DNSQuestionRecord;

return DNSQuestionRecord;

})();
