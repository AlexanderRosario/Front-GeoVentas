$(document).ready(function () {
  // Inicializar el mapa
  let map = L.map("map").setView([19.4326, -70.6787], 8);

  // Agregar capa de tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  let marker;
  let circle;

  // Función para obtener la población (GET)
  function getPopulation(lat, lng) {
    const apiUrl = `https://back-geoventas.onrender.com/population?lat=${lat}&lng=${lng}`;

    $.ajax({
      url: apiUrl,
      type: "GET", // Método GET
      success: function (response, status, xhr) {
        if (xhr.status === 200) {
          console.log("Población recibida:", response);
          $("#placePopulation").text(
            `Población: ${response.population || "No disponible"}`
          );
        }
      },
      error: function (xhr, status, error) {
        if (xhr.status === 422) {
          alert("Error de validación. Verifica los datos.");
        } else if (xhr.status === 400) {
          alert("Solicitud incorrecta. Revisa los parámetros.");
        } else {
          alert("Hubo un error al obtener la población. Intenta más tarde.");
        }
        $("#placePopulation").text("Población: No disponible");
      },
    });
  }

  // Función para enviar datos (POST)
  function sendData(lat, lng) {
    const apiUrl = "https://back-geoventas.onrender.com/population";
    const data = {
      lat: lat,
      lng: lng,
    };

    $.ajax({
      url: apiUrl,
      type: "POST", // Método POST
      contentType: "application/json",
      data: JSON.stringify(data),
      success: function (response) {
        console.log("Datos enviados:", response);
      },
      error: function (xhr, status, error) {
        console.error("Error al enviar los datos:", error);
      },
    });
  }

  // Función para actualizar datos (PUT)
  function updateData(lat, lng) {
    const apiUrl = `https://back-geoventas.onrender.com/population`;
    const data = {
      lat: lat,
      lng: lng,
    };

    $.ajax({
      url: apiUrl,
      type: "PUT", // Método PUT
      contentType: "application/json",
      data: JSON.stringify(data),
      success: function (response) {
        console.log("Datos actualizados:", response);
      },
      error: function (xhr, status, error) {
        console.error("Error al actualizar los datos:", error);
      },
    });
  }

  // Función para eliminar datos (DELETE)
  function deleteData(lat, lng) {
    const apiUrl = `https://back-geoventas.onrender.com/population?lat=${lat}&lng=${lng}`;

    $.ajax({
      url: apiUrl,
      type: "DELETE", // Método DELETE
      success: function (response) {
        console.log("Datos eliminados:", response);
      },
      error: function (xhr, status, error) {
        console.error("Error al eliminar los datos:", error);
      },
    });
  }

  // Función para manejar las opciones (OPTIONS)
  function handleOptions() {
    const apiUrl = `https://back-geoventas.onrender.com/population`;

    $.ajax({
      url: apiUrl,
      type: "OPTIONS", // Método OPTIONS
      success: function (response) {
        console.log("Métodos permitidos:", response);
      },
      error: function (xhr, status, error) {
        console.error("Error al obtener métodos permitidos:", error);
      },
    });
  }

  // Función de búsqueda
  function searchLocation() {
    const searchTerm = $("#searchInput").val().trim();
    if (!searchTerm) return;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      searchTerm
    )}`;

    $.getJSON(url, function (data) {
      if (data.length === 0) {
        alert("Ubicación no encontrada.");
        return;
      }

      const result = data[0];
      const coords = [parseFloat(result.lat), parseFloat(result.lon)];
      map.setView(coords, 12);

      if (marker) map.removeLayer(marker);
      if (circle) map.removeLayer(circle);

      marker = L.marker(coords).addTo(map);
      circle = L.circle(coords, { color: "red", radius: 1000 }).addTo(map);

      const popupContent = `
        <b>${result.display_name}</b><br>
        <p>Coordenadas: Lat ${result.lat}, Lng ${result.lon}</p>
      `;
      marker.bindPopup(popupContent).openPopup();

      $("#coordinateInput").val(`Lat: ${result.lat}, Lng: ${result.lon}`);
      $("#placeName").text(result.display_name);
      $("#placeCoordinates").text(`Lat: ${result.lat}, Lng: ${result.lon}`);

      // Llamar a la API de población
      getPopulation(result.lat, result.lon);
    }).fail(function () {
      alert("Error al conectar con la API de geocodificación.");
    });
  }

  // Función para agregar un punto en el mapa
  function addMarker() {
    map.off("click").on("click", function (e) {
      const coords = [e.latlng.lat, e.latlng.lng];

      if (marker) map.removeLayer(marker);
      if (circle) map.removeLayer(circle);

      marker = L.marker(coords).addTo(map);
      circle = L.circle(coords, { color: "red", radius: 1000 }).addTo(map);

      $("#coordinateInput").val(`Lat: ${coords[0]}, Lng: ${coords[1]}`);

      marker
        .bindPopup(
          `<b>Coordenadas:</b><br>Lat: ${coords[0]}</br>Lng: ${coords[1]}`
        )
        .openPopup();

      // Llamar a la API de población
      getPopulation(coords[0], coords[1]);
    });
  }

  // Habilitar la adición de marcadores
  addMarker();

  // Ejecutar búsqueda cuando se haga clic en el botón
  $("#searchBtn").on("click", function () {
    searchLocation();
  });

  // Ejemplo de uso de los métodos POST, PUT, DELETE y OPTIONS
  $("#sendDataBtn").on("click", function () {
    const lat = 19.4326; // Ejemplo de latitud
    const lng = -70.6787; // Ejemplo de longitud
    sendData(lat, lng); // Llamada POST
  });

  $("#updateDataBtn").on("click", function () {
    const lat = 19.4326; // Ejemplo de latitud
    const lng = -70.6787; // Ejemplo de longitud
    updateData(lat, lng); // Llamada PUT
  });

  $("#deleteDataBtn").on("click", function () {
    const lat = 19.4326; // Ejemplo de latitud
    const lng = -70.6787; // Ejemplo de longitud
    deleteData(lat, lng); // Llamada DELETE
  });

  $("#handleOptionsBtn").on("click", function () {
    handleOptions(); // Llamada OPTIONS
  });
});
