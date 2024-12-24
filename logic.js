// Create a map centered at a global view
const map = L.map('map').setView([20, 0], 2);

// Add a tile layer (base map)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to get color based on depth
function getColor(depth) {
    return depth > 90 ? '#d73027' :
           depth > 70 ? '#fc8d59' :
           depth > 50 ? '#fee08b' :
           depth > 30 ? '#d9ef8b' :
           depth > 10 ? '#91cf60' : '#1a9850';
}

// Function to get radius based on magnitude
function getRadius(magnitude) {
    return magnitude ? magnitude * 4 : 1; // Ensure a minimum size
}

// Fetch earthquake GeoJSON data
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    .then(response => response.json())
    .then(data => {
        // Add GeoJSON layer to the map
        L.geoJSON(data, {
            pointToLayer: (feature, latlng) => {
                const magnitude = feature.properties.mag;
                const depth = feature.geometry.coordinates[2];
                return L.circleMarker(latlng, {
                    radius: getRadius(magnitude),
                    fillColor: getColor(depth),
                    color: '#000',
                    weight: 1,
                    fillOpacity: 0.8
                });
            },
            onEachFeature: (feature, layer) => {
                const { place, mag } = feature.properties;
                const depth = feature.geometry.coordinates[2];
                layer.bindPopup(`
                    <strong>Location:</strong> ${place}<br>
                    <strong>Magnitude:</strong> ${mag}<br>
                    <strong>Depth:</strong> ${depth} km
                `);
            }
        }).addTo(map);

        // Add a legend to the map
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'legend');
            const grades = [-10, 10, 30, 50, 70, 90];
            const colors = ['#1a9850', '#91cf60', '#d9ef8b', '#fee08b', '#fc8d59', '#d73027'];

            div.innerHTML = '<h4>Depth (km)</h4>';
            for (let i = 0; i < grades.length; i++) {
                div.innerHTML += `
                    <i style="background:${colors[i]}"></i> 
                    ${grades[i]}${grades[i + 1] ? `&ndash;${grades[i + 1]}<br>` : '+'}`;
            }
            return div;
        };
        legend.addTo(map);
    })
    .catch(error => console.error('Error fetching data:', error));