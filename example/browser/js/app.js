window.addEventListener('load', function() {
  var services = document.getElementById('services');

  DNSSD.addEventListener('discovered', function(evt) {
    var list = services.querySelector('[data-address="' + evt.address + '"]');
    if (!list) {
      list = document.createElement('ul');
      list.dataset.address = evt.address;
    }

    list.innerHTML = '';

    evt.services.forEach(function(service) {
      var item = document.createElement('li');
      item.textContent = service;
      list.appendChild(item);
    });

    services.appendChild(list);
  });

  DNSSD.startDiscovery();
});
