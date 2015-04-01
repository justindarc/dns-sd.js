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

TODO: how to actually use the library.

## Examples

Each example app is in its own folder, and it is a completely functional app that you can open in WebIDE and deploy to your device.

Since this is about connecting various devices over the air, you will need two or more devices running the same app in order to actually see what it is about.

### Browser (`example/browser`)

TODO

### Chat (`example/chat`)

TODO
