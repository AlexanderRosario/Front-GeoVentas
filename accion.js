$(document).ready(function () {
  // Inicializar el mapa principal en Santo Domingo, RD
  let map = L.map("map").setView([18.4861, -69.9312], 13);
  let circle = null; // Almacena el círculo
  let radioSize = 2000; // Valor inicial del radio

  // Agregar capa base al mapa principal
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Agregar marcador inicial
  let marker = L.marker([18.4861, -69.9312])
    .addTo(map)
    .bindPopup("¡Hola desde Santo Domingo! 🌍")
    .openPopup();

  // Inicializar el mini mapa
  let miniMap = L.map("mini-map", {
    zoomControl: false,
    attributionControl: false,
  }).setView([18.4861, -69.9312], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  }).addTo(miniMap);

  let miniMarker = L.marker([18.4861, -69.9312]).addTo(miniMap);

  // Buscar ubicación ingresada
  $("#Local").click(function () {
    let locationName = $("#location").val().trim();
    if (locationName === "") {
      alert("Por favor, ingresa un nombre de ubicación.");
      return;
    }

    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      locationName
    )}`;
    $.getJSON(url, function (data) {
      if (data.length === 0) {
        alert("Ubicación no encontrada.");
        return;
      }

      let lat = parseFloat(data[0].lat);
      let lon = parseFloat(data[0].lon);
      actualizarMapa(lat, lon, locationName);
    });
  });

  // Evento para seleccionar una ubicación al hacer clic en el mapa
  map.on("click", function (e) {
    let lat = e.latlng.lat;
    let lon = e.latlng.lng;
    actualizarMapa(lat, lon, `(${lat.toFixed(4)}, ${lon.toFixed(4)})`);
  });

  function actualizarMapa(lat, lon, locationName) {
    // Mover el marcador y centrar el mapa
    marker
      .setLatLng([lat, lon])
      .bindPopup(`Ubicación: ${locationName}`)
      .openPopup();
    map.setView([lat, lon], 13);
    miniMarker.setLatLng([lat, lon]);
    miniMap.setView([lat, lon], 13);

    // Actualizar el radio del círculo
    if (circle) {
      map.removeLayer(circle);
    }
    circle = L.circle([lat, lon], {
      color: "blue",
      fillColor: "blue",
      fillOpacity: 0.3,
      radius: radioSize,
    }).addTo(map);

    // Obtener información del área
    obtenerInformacionDelArea(lat, lon);
  }

  function obtenerInformacionDelArea(lat, lon) {
    let url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    $.getJSON(url, function (data) {
      if (data.display_name) {
        $("#resultado").html(
          `<p><strong>Dirección:</strong> ${data.display_name}</p>`
        );
      } else {
        $("#resultado").html(
          "<p>No se encontró información para esta ubicación.</p>"
        );
      }
    }).fail(function () {
      $("#resultado").html("<p>Error al obtener información del área.</p>");
    });
  }

  // Cambiar el radio manualmente
  $("#setRadio").click(function () {
    let newRadio = parseInt($("#radioInput").val());
    if (isNaN(newRadio) || newRadio <= 0) {
      alert("Por favor, introduce un número válido para el radio.");
      return;
    }

    radioSize = newRadio;
    $("#radioValue").text(radioSize);

    if (circle) {
      circle.setRadius(radioSize);
    }
  });

  // Sincronización entre mapas
  map.on("moveend", function () {
    miniMap.setView(map.getCenter(), miniMap.getZoom());
  });

  map.on("zoom", function () {
    miniMap.setZoom(map.getZoom());
  });
});
