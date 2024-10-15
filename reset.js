// reset.js

document.getElementById('resetButton').addEventListener('click', function() {
    map.flyToBounds(defaultBounds, {
        duration: 1.5,
        maxZoom: 8,
        easeLinearity: 0.25
    });

    map.once('moveend', function() {
        closeLegislatorPanel();
        geojsonLayer.eachLayer(function(layer) {
            geojsonLayer.resetStyle(layer);
        });
        if (currentMarker) {
            map.removeLayer(currentMarker);
            currentMarker = null;
        }
    });
});