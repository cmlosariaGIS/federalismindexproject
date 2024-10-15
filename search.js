// search.js

function setupSearch() {
    const searchInput = document.getElementById('legislatorSearch');
    const searchResults = document.getElementById('searchResults');

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        if (searchTerm.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        const matchingLegislators = data.filter(legislator => 
            legislator.Name.toLowerCase().includes(searchTerm)
        );
        const matchingStates = geojsonLayer.getLayers().filter(layer => 
            layer.feature.properties.name.toLowerCase().includes(searchTerm)
        );

        let resultsHTML = '';

        if (matchingLegislators.length > 0) {
            resultsHTML += '<div class="search-category">Legislators</div>';
            resultsHTML += matchingLegislators.map(legislator => `
                <div class="search-result-item" data-type="legislator" data-state="${legislator.State}">
                    ${legislator.Name} - ${legislator.State} - ${legislator['House/Senate']}
                </div>
            `).join('');
        }

        if (matchingStates.length > 0) {
            resultsHTML += '<div class="search-category">States</div>';
            resultsHTML += matchingStates.map(layer => `
                <div class="search-result-item" data-type="state" data-state="${layer.feature.properties.name}">
                    ${layer.feature.properties.name}
                </div>
            `).join('');
        }

        if (resultsHTML) {
            searchResults.innerHTML = resultsHTML;
            searchResults.style.display = 'block';
        } else {
            searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
            searchResults.style.display = 'block';
        }
    });

    searchResults.addEventListener('click', function(e) {
        if (e.target.classList.contains('search-result-item')) {
            const stateName = e.target.dataset.state;
            const type = e.target.dataset.type;

            if (stateName) {
                geojsonLayer.eachLayer(function(layer) {
                    if (layer.feature.properties.name === stateName) {
                        var bounds = layer.getBounds();
                        map.flyToBounds(bounds, {
                            duration: 1.5,
                            maxZoom: 6
                        });
                        updateLegislatorPanel(stateName);
                        highlightState(stateName);
                        updateMarker(stateName);
                    }
                });
            }

            searchResults.style.display = 'none';
            searchInput.value = '';
        }
    });

    document.addEventListener('click', function(e) {
        if (!searchWidget.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}