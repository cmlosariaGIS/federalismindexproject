// dropdown.js

document.getElementById('stateSelect').addEventListener('change', function(e) {
    var selectedState = e.target.value;
    geojsonLayer.eachLayer(function(layer) {
        if (layer.feature.properties.name === selectedState) {
            var bounds = layer.getBounds();
            map.flyToBounds(bounds, {
                duration: 1.5,
                maxZoom: 6,
            });
            map.once('moveend', function() {
                updateLegislatorPanel(selectedState);
                highlightState(selectedState);
                updateMarker(selectedState);
            });
        }
    });
});