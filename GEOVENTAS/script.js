// script.js

// Inicializar el mapa
var map = L.map('map').setView([19.4326, -70.6787], 8);

// Agregar capa de tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let marker;
let circle;

// Función de búsqueda
function searchLocation() {
    const searchTerm = document.getElementById('searchInput').value;
    if (!searchTerm) return;

    // Geocodificación
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchTerm}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const coords = [data[0].lat, data[0].lon];
                map.setView(coords, 12);

                // Limpiar marcadores anteriores
                if (map.hasLayer(marker)) map.removeLayer(marker);
                if (map.hasLayer(circle)) map.removeLayer(circle);

                // Agregar marcador personalizado
                marker = L.marker(coords, {
                    icon: L.divIcon({
                        className: 'marker',
                        html: '<div></div>',
                        iconSize: [25, 41]
                    })
                }).addTo(map);

                // Agregar círculo de 1km
                circle = L.circle(coords, {
                    color: 'red',
                    radius: 1000,
                }).addTo(map);

                marker.bindPopup(`<b>${data[0].display_name}</b>`).openPopup();
            }
        });
}

// Función para agregar punto en el mapa
function addMarker() {
    map.on('click', function(e) {
        const coords = [e.latlng.lat, e.latlng.lng];
        if (map.hasLayer(marker)) map.removeLayer(marker);
        if (map.hasLayer(circle)) map.removeLayer(circle);
        marker = L.marker(coords, {
            icon: L.divIcon({
                className: 'marker',
                html: '<div></div>',
                iconSize: [25, 41]
            })
        }).addTo(map);

        circle = L.circle(coords, {
            color: 'red',
            radius: 1000,
        }).addTo(map);

        document.getElementById('coordinateInput').value = `Lat: ${coords[0]}, Lng: ${coords[1]}`;

        // Enviar coordenadas y lugar a la API
        const lugar = 'nombre_del_lugar'; // Cambia esto según tu lógica
        const data = {
            coordenadas: { lat: coords[0], lng: coords[1] },
            lugar: lugar
        };

        fetch('https://tu-api.com/endpoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
}

// Llamar a la función para habilitar la adición de marcadores
addMarker();