// map.js

var tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var map = L.map('map', {
    layers: [tileLayer]
}).setView([37.8, -96], 4);

var defaultBounds = L.latLngBounds([[24.396308, -125.0], [49.384358, -66.93457]]);

var statesToColor = [...new Set(data.map(item => item.State))];

var geojsonLayer;
var currentMarker;

function getFillOpacity(zoom) {
    return zoom >= 6 ? 0.75 : 1;
}

fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
    .then(response => response.json())
    .then(geoData => {
        geojsonLayer = L.geoJSON(geoData, {
            style: function (feature) {
                return {
                    fillColor: statesToColor.includes(feature.properties.name) ? '#28a745' : '#c3e0e5',
                    fillOpacity: getFillOpacity(map.getZoom()),
                    weight: 0.75,
                    opacity: 1,
                    color: 'white'
                };
            },

            // Inside the fetch(..).then() block, modify the onEachFeature function:

onEachFeature: function(feature, layer) {
    var option = document.createElement('option');
    option.value = feature.properties.name;
    option.text = feature.properties.name;
    document.getElementById('stateSelect').add(option);

    layer.on('mouseover', function(e) {
        layer.setStyle({
            weight: 2,
            color: '#0c2d48',
            opacity: 1,
            dashArray: '1',
            boxShadow: '0 0 10px #0c2d48'
        });

        var infoPanel = document.getElementById('infoPanel');
        infoPanel.innerHTML = feature.properties.name;
        infoPanel.style.display = 'block';
        updateInfoPanelPosition(e.latlng);
    });

    layer.on('mouseout', function() {
        geojsonLayer.resetStyle(layer);
        var infoPanel = document.getElementById('infoPanel');
        infoPanel.style.display = 'none';
    });

    layer.on('click', function() {
        var stateName = feature.properties.name;
        var bounds = layer.getBounds();
        var center = bounds.getCenter();
        
        // Fly to the center of the state with a specific zoom level
        map.flyTo(center, 6, {
            duration: 1  // Duration of the animation in seconds
        });

        map.once('moveend', function() {
            updateLegislatorPanel(stateName);
            highlightState(stateName);
            updateMarker(stateName);
        });
    });
}
        }).addTo(map);

        map.on('zoomend', function () {
            geojsonLayer.setStyle(function (feature) {
                return {
                    fillOpacity: getFillOpacity(map.getZoom())
                };
            });
        });

        setupSearch();
    });

var basemapLayerEnabled = true;

function updateInfoPanelPosition(latlng) {
    var infoPanel = document.getElementById('infoPanel');
    var point = map.latLngToContainerPoint(latlng);
    infoPanel.style.left = (point.x + 10) + 'px';
    infoPanel.style.top = (point.y + 10) + 'px';
}

map.on('mousemove', function (e) {
    if (document.getElementById('infoPanel').style.display === 'block') {
        updateInfoPanelPosition(e.latlng);
    }
});

function highlightState(stateName) {
    geojsonLayer.eachLayer(function (layer) {
        if (layer.feature.properties.name === stateName) {
            layer.setStyle({
                weight: 5,
                color: '#2a6b37',
                dashArray: '',
                fillOpacity: 0.7
            });
        } else {
            geojsonLayer.resetStyle(layer);
        }
    });
}

function updateMarker(stateName) {
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    let latlng;
    if (stateName === 'Florida') {
        latlng = L.latLng(28.537280744523006, -81.8381571309186);
    } else if (stateName === 'Alaska') {
        latlng = L.latLng(66.11338507961604, -152.21651764735444);
    } else {
        geojsonLayer.eachLayer(function (layer) {
            if (layer.feature.properties.name === stateName) {
                var polygon = layer.feature.geometry;
                var point = turf.pointOnFeature(polygon);
                latlng = L.latLng(point.geometry.coordinates[1], point.geometry.coordinates[0]);
            }
        });
    }

    if (latlng) {
        currentMarker = L.marker(latlng, {
            icon: L.divIcon({
                className: 'gps-icon',
                html: '<span class="material-icons-outlined">location_on</span>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            })
        }).addTo(map);
    }
}

