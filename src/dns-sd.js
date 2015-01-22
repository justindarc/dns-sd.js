/*jshint esnext:true*/
/*exported DNSSD*/
'use strict';

module.exports = window.DNSSD = (function() {

var DNSRecord         = require('./dns-record');
var DNSResourceRecord = require('./dns-resource-record');
var DNSPacket         = require('./dns-packet');
var DNSCodes          = require('./dns-codes');
var DNSUtils          = require('./dns-utils');

var EventTarget       = require('./event-target');
var ByteArray         = require('./byte-array');
var BinaryUtils       = require('./binary-utils');
var IPUtils           = require('./ip-utils');

const DNSSD_SERVICE_NAME    = '_services._dns-sd._udp.local';
const DNSSD_MULTICAST_GROUP = '224.0.0.251';
const DNSSD_PORT            = 5353;

var DNSSD = new EventTarget();

var discovering = false;
var services = {};

DNSSD.getSocket = function() {
  return new Promise((resolve) => {
    if (!this.socket) {
      this.socket = new UDPSocket({
        loopback: true,
        localPort: DNSSD_PORT
      });

      this.socket.onmessage = (message) => {
        var packet = new DNSPacket(new ByteArray(message.data));

        switch (packet.flags.QR) {
          case DNSCodes.QUERY_RESPONSE_CODES.QUERY:
            handleQueryPacket.call(this, packet, message);
            break;
          case DNSCodes.QUERY_RESPONSE_CODES.RESPONSE:
            handleResponsePacket.call(this, packet, message);
            break;
          default:
            break;
        }
      };

      this.socket.joinMulticastGroup(DNSSD_MULTICAST_GROUP);
    }

    this.socket.opened.then(() => {
      resolve(this.socket);
    });
  });
};

DNSSD.startDiscovery = function() {
  discovering = true;

  // Broadcast query for advertised services.
  discover.call(this);
};

DNSSD.stopDiscovery = function() {
  discovering = false;
};

DNSSD.registerService = function(serviceName, port, options) {
  services[serviceName] = {
    port: port || 0,
    options: options || {}
  };

  // Broadcast advertisement of registered services.
  advertise.call(this);
};

DNSSD.unregisterService = function(serviceName) {
  delete services[serviceName];

  // Broadcast advertisement of registered services.
  advertise.call(this);
};

function handleQueryPacket(packet, message) {
  packet.getRecords('QD').forEach((record) => {
    // Don't respond if the query's class code is not IN or ANY.
    if (record.classCode !== DNSCodes.CLASS_CODES.IN &&
        record.classCode !== DNSCodes.CLASS_CODES.ANY) {
      return;
    }

    // Don't respond if the query's record type is not PTR, SRV or ANY.
    if (record.recordType !== DNSCodes.RECORD_TYPES.PTR &&
        record.recordType !== DNSCodes.RECORD_TYPES.SRV &&
        record.recordType !== DNSCodes.RECORD_TYPES.ANY) {
      return;
    }

    // Broadcast advertisement of registered services.
    advertise.call(this);
  });
}

function handleResponsePacket(packet, message) {
  if (!discovering) {
    return;
  }

  var services = [];
  packet.getRecords('AN').forEach((record) => {
    if (record.recordType === DNSCodes.RECORD_TYPES.PTR) {
      services.push(record.data);
    }
  });

  this.dispatchEvent('discovered', {
    message: message,
    packet: packet,
    address: message.remoteAddress,
    services: services
  });
}

function discover() {
  var packet = new DNSPacket();

  packet.flags.QR = DNSCodes.QUERY_RESPONSE_CODES.QUERY;

  var question = new DNSRecord({
    name: DNSSD_SERVICE_NAME,
    recordType: DNSCodes.RECORD_TYPES.PTR
  });

  packet.addRecord('QD', question);

  this.getSocket().then((socket) => {
    var data = packet.serialize();
    socket.send(data, DNSSD_MULTICAST_GROUP, DNSSD_PORT);
  });
}

function advertise() {
  if (Object.keys(services).length === 0) {
    return;
  }

  var packet = new DNSPacket();

  packet.flags.QR = DNSCodes.QUERY_RESPONSE_CODES.RESPONSE;
  packet.flags.AA = DNSCodes.AUTHORITATIVE_ANSWER_CODES.YES;

  for (var serviceName in services) {
    addServiceToPacket(serviceName, packet);
  }

  this.getSocket().then((socket) => {
    var data = packet.serialize();
    socket.send(data, DNSSD_MULTICAST_GROUP, DNSSD_PORT);

    // Re-broadcast announcement after 1000ms (RFC6762, 8.3).
    // setTimeout(() => {
    //   socket.send(data, DNSSD_MULTICAST_GROUP, DNSSD_PORT);
    // }, 1000);
  });
}

function addServiceToPacket(serviceName, packet) {
  var service = services[serviceName];
  if (!service) {
    return;
  }

  var alias = serviceName;

  // SRV Record
  // var srvData = new ByteArray();
  // srvData.push(0x0000, 2);        // Priority
  // srvData.push(0x0000, 2);        // Weight
  // srvData.push(service.port, 2);  // Port
  // srvData.append(DNSUtils.labelToByteArray(serviceName));

  // var srv = new DNSResourceRecord({
  //   name: alias,
  //   recordType: DNSCodes.RECORD_TYPES.SR,
  //   data: srvData
  // });

  // packet.addRecord('AR', srv);

  // TXT Record
  // var txtData = new ByteArray();

  // for (var key in service.options) {
  //   txtData.append(DNSUtils.labelToByteArray(key + '=' + service.options[key]));
  // }
  
  // var txt = new DNSResourceRecord({
  //   name: alias,
  //   recordType: DNSCodes.RECORD_TYPES.TXT,
  //   data: txtData
  // });

  // packet.addRecord('AR', txt);

  // PTR Wildcard Record
  var ptrWildcard = new DNSResourceRecord({
    name: DNSSD_SERVICE_NAME,
    recordType: DNSCodes.RECORD_TYPES.PTR,
    data: serviceName
  });

  packet.addRecord('AN', ptrWildcard);

  // PTR Service Record
  var ptrService = new DNSResourceRecord({
    name: serviceName,
    recordType: DNSCodes.RECORD_TYPES.PTR,
    data: alias
  });

  packet.addRecord('AN', ptrService);
}

return DNSSD;

})();
