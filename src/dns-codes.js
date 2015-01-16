/*jshint esnext:true*/
/*exported DNSCodes*/
'use strict';

module.exports = window.DNSCodes = (function() {

const QUERY_RESPONSE_CODES = defineType({
  QUERY       : 0,      // RFC 1035 - Query
  RESPONSE    : 1       // RFC 1035 - Reponse
});

const OPERATION_CODES = defineType({
  QUERY       : 0,      // RFC 1035 - Query
  IQUERY      : 1,      // RFC 1035 - Inverse Query
  STATUS      : 2,      // RFC 1035 - Status
  NOTIFY      : 4,      // RFC 1996 - Notify
  UPDATE      : 5       // RFC 2136 - Update
});

const AUTHORITATIVE_ANSWER_CODES = defineType({
  NO          : 0,      // RFC 1035 - Not Authoritative
  YES         : 1       // RFC 1035 - Is Authoritative
});

const TRUNCATED_RESPONSE_CODES = defineType({
  NO          : 0,      // RFC 1035 - Not Truncated
  YES         : 1       // RFC 1035 - Is Truncated
});

const RECURSION_DESIRED_CODES = defineType({
  NO          : 0,      // RFC 1035 - Recursion Not Desired
  YES         : 1       // RFC 1035 - Recursion Is Desired
});

const RECURSION_AVAILABLE_CODES = defineType({
  NO          : 0,      // RFC 1035 - Recursive Query Support Not Available
  YES         : 1       // RFC 1035 - Recursive Query Support Is Available
});

const AUTHENTIC_DATA_CODES = defineType({
  NO          : 0,      // RFC 4035 - Response Has Not Been Authenticated/Verified
  YES         : 1       // RFC 4035 - Response Has Been Authenticated/Verified
});

const CHECKING_DISABLED_CODES = defineType({
  NO          : 0,      // RFC 4035 - Authentication/Verification Checking Not Disabled
  YES         : 1       // RFC 4035 - Authentication/Verification Checking Is Disabled
});

const RETURN_CODES = defineType({
  NOERROR     : 0,      // RFC 1035 - No Error
  FORMERR     : 1,      // RFC 1035 - Format Error
  SERVFAIL    : 2,      // RFC 1035 - Server Failure
  NXDOMAIN    : 3,      // RFC 1035 - Non-Existent Domain
  NOTIMP      : 4,      // RFC 1035 - Not Implemented
  REFUSED     : 5,      // RFC 1035 - Query Refused
  YXDOMAIN    : 6,      // RFC 2136 - Name Exists when it should not
  YXRRSET     : 7,      // RFC 2136 - RR Set Exists when it should not
  NXRRSET     : 8,      // RFC 2136 - RR Set that should exist does not
  NOTAUTH     : 9,      // RFC 2136 - Server Not Authoritative for zone
  NOTZONE     : 10      // RFC 2136 - NotZone Name not contained in zone
});

const CLASS_CODES = defineType({
  IN          : 1,      // RFC 1035 - Internet
  CS          : 2,      // RFC 1035 - CSNET
  CH          : 3,      // RFC 1035 - CHAOS
  HS          : 4,      // RFC 1035 - Hesiod
  NONE        : 254,    // RFC 2136 - None
  ANY         : 255     // RFC 1035 - Any
});

const OPTION_CODES = defineType({
  LLQ         : 1,      // RFC ???? - Long-Lived Queries
  UL          : 2,      // RFC ???? - Update Leases
  NSID        : 3,      // RFC ???? - Name Server Identifier
  OWNER       : 4,      // RFC ???? - Owner
  UNKNOWN     : 65535   // RFC ???? - Token
});

const RECORD_TYPES = defineType({
  SIGZERO     : 0,      // RFC 2931
  A           : 1,      // RFC 1035
  NS          : 2,      // RFC 1035
  MD          : 3,      // RFC 1035
  MF          : 4,      // RFC 1035
  CNAME       : 5,      // RFC 1035
  SOA         : 6,      // RFC 1035
  MB          : 7,      // RFC 1035
  MG          : 8,      // RFC 1035
  MR          : 9,      // RFC 1035
  NULL        : 10,     // RFC 1035
  WKS         : 11,     // RFC 1035
  PTR         : 12,     // RFC 1035
  HINFO       : 13,     // RFC 1035
  MINFO       : 14,     // RFC 1035
  MX          : 15,     // RFC 1035
  TXT         : 16,     // RFC 1035
  RP          : 17,     // RFC 1183
  AFSDB       : 18,     // RFC 1183
  X25         : 19,     // RFC 1183
  ISDN        : 20,     // RFC 1183
  RT          : 21,     // RFC 1183
  NSAP        : 22,     // RFC 1706
  NSAP_PTR    : 23,     // RFC 1348
  SIG         : 24,     // RFC 2535
  KEY         : 25,     // RFC 2535
  PX          : 26,     // RFC 2163
  GPOS        : 27,     // RFC 1712
  AAAA        : 28,     // RFC 1886
  LOC         : 29,     // RFC 1876
  NXT         : 30,     // RFC 2535
  EID         : 31,     // RFC ????
  NIMLOC      : 32,     // RFC ????
  SRV         : 33,     // RFC 2052
  ATMA        : 34,     // RFC ????
  NAPTR       : 35,     // RFC 2168
  KX          : 36,     // RFC 2230
  CERT        : 37,     // RFC 2538
  DNAME       : 39,     // RFC 2672
  OPT         : 41,     // RFC 2671
  APL         : 42,     // RFC 3123
  DS          : 43,     // RFC 4034
  SSHFP       : 44,     // RFC 4255
  IPSECKEY    : 45,     // RFC 4025
  RRSIG       : 46,     // RFC 4034
  NSEC        : 47,     // RFC 4034
  DNSKEY      : 48,     // RFC 4034
  DHCID       : 49,     // RFC 4701
  NSEC3       : 50,     // RFC ????
  NSEC3PARAM  : 51,     // RFC ????
  HIP         : 55,     // RFC 5205
  SPF         : 99,     // RFC 4408
  UINFO       : 100,    // RFC ????
  UID         : 101,    // RFC ????
  GID         : 102,    // RFC ????
  UNSPEC      : 103,    // RFC ????
  TKEY        : 249,    // RFC 2930
  TSIG        : 250,    // RFC 2931
  IXFR        : 251,    // RFC 1995
  AXFR        : 252,    // RFC 1035
  MAILB       : 253,    // RFC 1035
  MAILA       : 254,    // RFC 1035
  ANY         : 255,    // RFC 1035
  DLV         : 32769   // RFC 4431
});

function defineType(values) {
  function T(value) {
    for (var name in T) {
      if (T[name] === value) {
        return name;
      }
    }

    return null;
  }

  for (var name in values) {
    T[name] = values[name];
  }

  return T;
}

var DNSCodes = {
  QUERY_RESPONSE_CODES        : QUERY_RESPONSE_CODES,
  OPERATION_CODES             : OPERATION_CODES,
  AUTHORITATIVE_ANSWER_CODES  : AUTHORITATIVE_ANSWER_CODES,
  TRUNCATED_RESPONSE_CODES    : TRUNCATED_RESPONSE_CODES,
  RECURSION_DESIRED_CODES     : RECURSION_DESIRED_CODES,
  RECURSION_AVAILABLE_CODES   : RECURSION_AVAILABLE_CODES,
  AUTHENTIC_DATA_CODES        : AUTHENTIC_DATA_CODES,
  CHECKING_DISABLED_CODES     : CHECKING_DISABLED_CODES,
  RETURN_CODES                : RETURN_CODES,
  CLASS_CODES                 : CLASS_CODES,
  OPTION_CODES                : OPTION_CODES,
  RECORD_TYPES                : RECORD_TYPES
};

return DNSCodes;

})();
