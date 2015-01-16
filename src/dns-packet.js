/*jshint esnext:true*/
/*exported DNSPacket*/
'use strict';

module.exports = window.DNSPacket = (function() {

var DNSQuestionRecord = require('./dns-question-record');
var DNSResourceRecord = require('./dns-resource-record');
var DNSUtils          = require('./dns-utils');

var ByteArray         = require('./byte-array');

const DNS_PACKET_RECORD_SECTION_TYPES = [
  'QD', // Question
  'AN', // Answer
  'NS', // Authority
  'AR'  // Additional
];

/**
 * DNS Packet Structure
 * *************************************************
 *
 * Header
 * ======
 *
 * 00                   2-Bytes                   15
 * -------------------------------------------------
 * |00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|
 * -------------------------------------------------
 * |<==================== ID =====================>|
 * |QR|<== OP ===>|AA|TC|RD|RA|UN|AD|CD|<== RC ===>|
 * |<================== QDCOUNT ==================>|
 * |<================== ANCOUNT ==================>|
 * |<================== NSCOUNT ==================>|
 * |<================== ARCOUNT ==================>|
 * -------------------------------------------------
 *
 * ID:        2-Bytes
 * FLAGS:     2-Bytes
 *  - QR:     1-Bit
 *  - OP:     4-Bits
 *  - AA:     1-Bit
 *  - TC:     1-Bit
 *  - RD:     1-Bit
 *  - RA:     1-Bit
 *  - UN:     1-Bit
 *  - AD:     1-Bit
 *  - CD:     1-Bit
 *  - RC:     4-Bits
 * QDCOUNT:   2-Bytes
 * ANCOUNT:   2-Bytes
 * NSCOUNT:   2-Bytes
 * ARCOUNT:   2-Bytes
 *
 *
 * Data
 * ====
 *
 * 00                   2-Bytes                   15
 * -------------------------------------------------
 * |00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|
 * -------------------------------------------------
 * |<???=============== QD[...] ===============???>|
 * |<???=============== AN[...] ===============???>|
 * |<???=============== NS[...] ===============???>|
 * |<???=============== AR[...] ===============???>|
 * -------------------------------------------------
 *
 * QD:        ??-Bytes
 * AN:        ??-Bytes
 * NS:        ??-Bytes
 * AR:        ??-Bytes
 *
 *
 * Question Record
 * ===============
 *
 * 00                   2-Bytes                   15
 * -------------------------------------------------
 * |00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|
 * -------------------------------------------------
 * |<???================ NAME =================???>|
 * |<=================== TYPE ====================>|
 * |<=================== CLASS ===================>|
 * -------------------------------------------------
 *
 * NAME:      ??-Bytes
 * TYPE:      2-Bytes
 * CLASS:     2-Bytes
 *
 *
 * Resource Record
 * ===============
 *
 * 00                   4-Bytes                   31
 * -------------------------------------------------
 * |00|02|04|06|08|10|12|14|16|18|20|22|24|26|28|30|
 * -------------------------------------------------
 * |<???================ NAME =================???>|
 * |<======= TYPE ========>|<======= CLASS =======>|
 * |<==================== TTL ====================>|
 * |<====== DATALEN ======>|<???==== DATA =====???>|
 * -------------------------------------------------
 *
 * NAME:      ??-Bytes
 * TYPE:      2-Bytes
 * CLASS:     2-Bytes
 * DATALEN:   2-Bytes
 * DATA:      ??-Bytes (Specified By DATALEN)
 */
function DNSPacket(arrayBuffer) {
  this.flags = DNSUtils.valueToFlags(0x0000);
  this.records = {};

  DNSPacket.RECORD_SECTION_TYPES.forEach((recordSectionType) => {
    this.records[recordSectionType] = [];
  });

  if (!arrayBuffer) {
    return this;
  }

  var byteArray = new ByteArray(arrayBuffer);
  var reader = byteArray.getReader();

  if (reader.getValue(2) !== 0x0000) {
    throw new Error('Packet must start with 0x0000');
  }

  this.flags = DNSUtils.valueToFlags(reader.getValue(2));

  var recordCounts = {};

  // Parse the record counts.
  DNSPacket.RECORD_SECTION_TYPES.forEach((recordSectionType) => {
    recordCounts[recordSectionType] = reader.getValue(2);
  });

  // Parse the actual records.
  DNSPacket.RECORD_SECTION_TYPES.forEach((recordSectionType) => {
    var count = recordCounts[recordSectionType];
    var name;

    for (var i = 0; i < count; i++) {
      name = DNSUtils.byteArrayToName(reader);// || name;

      if (recordSectionType === 'QD') {
        this.addRecord(recordSectionType, new DNSQuestionRecord(
          name,               // Name
          reader.getValue(2), // Type
          reader.getValue(2)  // Class
        ));
      }

      else {
        this.addRecord(recordSectionType, new DNSResourceRecord(
          name,                               // Name
          reader.getValue(2),                 // Type
          reader.getValue(2),                 // Class
          reader.getValue(4),                 // TTL
          reader.getBytes(reader.getValue(2)) // Data
        ));
      }
    }
  });

  if (!reader.isEOF()) {
    console.warn('Did not complete parsing packet data');
  }
}

DNSPacket.RECORD_SECTION_TYPES = DNS_PACKET_RECORD_SECTION_TYPES;

DNSPacket.prototype.constructor = DNSPacket;

DNSPacket.prototype.addRecord = function(recordSectionType, record) {
  this.records[recordSectionType].push(record);
};

DNSPacket.prototype.getRecords = function(recordSectionType) {
  return this.records[recordSectionType];
};

DNSPacket.prototype.serialize = function() {
  var byteArray = new ByteArray();

  byteArray.push(0x0000, 2);
  byteArray.push(DNSUtils.flagsToValue(this.flags), 2);

  DNSPacket.RECORD_SECTION_TYPES.forEach((recordSectionType) => {
    byteArray.push(this.records[recordSectionType].length, 2);
  });

  DNSPacket.RECORD_SECTION_TYPES.forEach((recordSectionType) => {
    this.records[recordSectionType].forEach((record) => {
      byteArray.append(DNSUtils.nameToByteArray(record.name));
      byteArray.push(record.recordType, 2);
      byteArray.push(record.classCode, 2);

      // No more data to serialize if this is a question record.
      if (recordSectionType === 'QD') {
        return;
      }

      byteArray.push(record.ttl, 4);

      var data = record.data;
      if (data instanceof ByteArray) {
        data = new Uint8Array(data.buffer);
      }

      if (data instanceof ArrayBuffer) {
        data = new Uint8Array(data);
      }

      byteArray.push(data.length, 2);
      byteArray.append(data);
    });
  });

  return byteArray.buffer;
};

return DNSPacket;

})();
