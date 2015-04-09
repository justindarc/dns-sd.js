dns-sd.js
=========

A JavaScript implementation of mDNS/DNS-SD for Firefox OS

## Usage

Clone repository. Then run `npm install` for fulfilling dependencies before you attempt to build the library.

### Building

```javascript
npm run build
```

This will regenerate a distributable version of the library in `dist/dns-sd.js`.

It also copies the distributable version to the `lib` directory in each of the two example apps, placed in the `example` folder.

### Including

You can include the distributable file in your Firefox OS app, using a script tag:

```html
<script src="dns-sd.js"></script>
```

Or if you want to use browserify and node.js to build your app, maybe you can install this module from git with npm:

```bash
npm install --save ssh+https://github.com/justindarc/dns-sd.js.git
```

and then you can require the module as usual in node.js land:

```javascript
var DNSSD = require('dns-sd');
```

TODO: test to see if this works.

### In practice

This library requires that your app has access to UDP sockets, so you need to specify this in the `permissions` field in your `manifest.webapp` file:

```javascript
{
  "udp-socket": {}
}
```

More often than not, you will also want to use TCP sockets for connecting to the discovered services, so you need to specify the TCP socket permission too if your app wants to establish TCP connections too. The permissions would look like this: 

```javascript
{
  "tcp-socket": {},
  "udp-socket": {}
}
```
#### Registering a service

```javascript
DNSSD.registerService('_your_service_name._tcp.local', port_number, {});
```

Service names must end in `.local`.

#### Discovering services

```javascript
DNSSD.addEventListener('discovered', function(evt) {
  // A service broadcast event was received
  // i.e. we "discovered" something new
});

DNSSD.startDiscovery();
```

where `evt` is a discoveredEvent which contains some bits of interesting information:


* `address` – the address of the host which is exposing services
* `services` – an array with the names of the services in the host

## Examples

Each example app is in its own folder, and it is a completely functional app that you can open in [WebIDE](https://developer.mozilla.org/en-US/docs/Tools/WebIDE) and deploy to your device.

### Browser (`example/browser`)

This example will start service discovery on the `DNSSD` object, then display the discovered services per host on the screen.

### Chat (`example/chat`)

Since this is about connecting various devices over the air, you will need two or more devices running the same app in order to actually see what it is about.
