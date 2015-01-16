var peers = [];

var httpServer = new HTTPServer(8080);
httpServer.start();

window.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    httpServer.stop();
  } else {
    httpServer.start();
  }
});

window.addEventListener('load', function() {
  var form = document.getElementById('form');
  var name = document.getElementById('name');
  var message = document.getElementById('message');
  var conversation = document.getElementById('conversation');

  name.value = localStorage.getItem('name') || 'Unknown user';

  name.addEventListener('keyup', function() {
    localStorage.setItem('name', name.value);
  });

  form.addEventListener('submit', function(evt) {
    evt.preventDefault();

    var formData = new FormData(form);

    peers.forEach(function(peer) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://' + peer + ':8080', true);
      xhr.send(formData);
    });

    message.value = '';
  });

  httpServer.addEventListener('request', function(evt) {
    conversation.innerHTML += '<p>' +
      '<strong>' + evt.request.body.name + ': </strong>' +
      evt.request.body.message +
    '</p>';
    conversation.scrollTop = conversation.scrollHeight;
  });

  DNSSD.addEventListener('discovered', function(evt) {
    var isChatPeer = evt.services.find((service) => {
      return service === '_fxos-chat._tcp.local';
    });

    if (!isChatPeer) {
      return;
    }

    var isConnected = peers.find((peer) => {
      return peer === evt.address;
    });

    if (!isConnected) {
      peers.push(evt.address);
    }
  });

  DNSSD.startDiscovery();
});

DNSSD.registerService('_fxos-chat._tcp.local', 8080, {});
