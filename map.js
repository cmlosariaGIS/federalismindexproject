var tileLayer=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});var map=L.map('map',{layers:[tileLayer]}).setView([37.8,-96],4);var defaultBounds=L.latLngBounds([[24.396308,-125.0],[49.384358,-66.93457]]);var statesToColor=[...new Set(data.map(item=>item.State))];var geojsonLayer;var currentMarker;function getFillOpacity(zoom){return zoom>=6?0.75:1;}
fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json').then(response=>response.json()).then(geoData=>{geojsonLayer=L.geoJSON(geoData,{style:function(feature){return{fillColor:statesToColor.includes(feature.properties.name)?'#28a745':'#c3e0e5',fillOpacity:getFillOpacity(map.getZoom()),weight:0.75,opacity:1,color:'white'};},onEachFeature:function(feature,layer){var option=document.createElement('option');option.value=feature.properties.name;option.text=feature.properties.name;document.getElementById('stateSelect').add(option);layer.on('mouseover',function(e){layer.setStyle({weight:2,color:'#0c2d48',opacity:1,dashArray:'1',boxShadow:'0 0 10px #0c2d48'});var infoPanel=document.getElementById('infoPanel');infoPanel.innerHTML=feature.properties.name;infoPanel.style.display='block';updateInfoPanelPosition(e.latlng);});layer.on('mouseout',function(){geojsonLayer.resetStyle(layer);var infoPanel=document.getElementById('infoPanel');infoPanel.style.display='none';});layer.on('click',function(){var stateName=feature.properties.name;updateLegislatorPanel(stateName);});}}).addTo(map);map.on('zoomend',function(){geojsonLayer.setStyle(function(feature){return{fillOpacity:getFillOpacity(map.getZoom())};});});document.getElementById('stateSelect').addEventListener('change',function(e){var selectedState=e.target.value;geojsonLayer.eachLayer(function(layer){if(layer.feature.properties.name===selectedState){var bounds=layer.getBounds();map.flyToBounds(bounds,{duration:1.5,maxZoom:6,});map.once('moveend',function(){updateLegislatorPanel(selectedState);highlightState(selectedState);updateMarker(selectedState);});}});});setupSearch();});var basemapLayerEnabled=true;document.getElementById('resetButton').addEventListener('click',function(){map.flyToBounds(defaultBounds,{duration:1.5,maxZoom:8,easeLinearity:0.25});map.once('moveend',function(){closeLegislatorPanel();geojsonLayer.eachLayer(function(layer){geojsonLayer.resetStyle(layer);});if(currentMarker){map.removeLayer(currentMarker);currentMarker=null;}});});document.getElementById('stateSelect').addEventListener('change',function(e){var selectedState=e.target.value;geojsonLayer.eachLayer(function(layer){if(layer.feature.properties.name===selectedState){map.flyToBounds(layer.getBounds(),{duration:1.5,maxZoom:6,});map.once('moveend',function(){updateLegislatorPanel(selectedState);highlightState(selectedState);});}});});function updateInfoPanelPosition(latlng){var infoPanel=document.getElementById('infoPanel');var point=map.latLngToContainerPoint(latlng);infoPanel.style.left=(point.x+10)+'px';infoPanel.style.top=(point.y+10)+'px';}
map.on('mousemove',function(e){if(document.getElementById('infoPanel').style.display==='block'){updateInfoPanelPosition(e.latlng);}});function updateLegislatorPanel(stateName){var legislatorPanel=document.getElementById('legislatorPanel');let panelContent=`
        <button id="closePanelButton" class="close-button">
            <span class="material-icons-outlined">close</span>
        </button>
        <h3>Legislators in ${stateName}</h3>
    `;if(typeof data==='undefined'){console.error("Legislator data is not loaded. Make sure data.js is properly linked.");panelContent+="<p>Error: Legislator data not available</p>";}else{var legislators=data.filter(d=>d.State===stateName);if(legislators.length===0){panelContent+="<p>No legislator data available for this state.</p>";}else{let stateWebsite=legislators[0]['State Website'];panelContent+=`
                <div class="state-website">
                    <span class="material-symbols-outlined">language</span>
                    <a href="${stateWebsite}" target="_blank">${stateWebsite}</a>
                </div>
            `;var houseLegislators=legislators.filter(l=>l['House/Senate']==='House');var senateLegislators=legislators.filter(l=>l['House/Senate']==='Senate');if(houseLegislators.length>0){panelContent+=createSection('House',houseLegislators);}
if(senateLegislators.length>0){panelContent+=createSection('Senate',senateLegislators);}}}
legislatorPanel.innerHTML=panelContent;legislatorPanel.style.display='block';updateMarker(stateName);document.getElementById('closePanelButton').addEventListener('click',closeLegislatorPanel);document.querySelectorAll('.section-header').forEach(header=>{header.addEventListener('click',function(){this.querySelector('.chevron').classList.toggle('up');this.nextElementSibling.classList.toggle('collapsed');});});}
function createSection(title,legislators){let logoUrl=title==='House'?'https://jackson.house.gov/images/seal.png':'https://www.fpri.org/wp-content/uploads/2017/01/us-senate-seal-400x400.png';let html=`
    <div class="section-header">
        <div class="section-title">
            <img src="${logoUrl}" alt="${title} logo" class="section-logo">
            <h4>${title}</h4>
        </div>
        <span class="material-icons-outlined chevron">expand_circle_down</span>
    </div>
    <div class="section-content collapsed">
    `;let committeesMap={};legislators.forEach(legislator=>{if(!committeesMap[legislator.Committee]){committeesMap[legislator.Committee]={description:legislator['Definition website'],websiteLink:legislator['COMMITTEE WEBSITE LINK'],legislators:[]};}
committeesMap[legislator.Committee].legislators.push(legislator);});for(let[committeeName,committeeData]of Object.entries(committeesMap)){html+=`
        <div class="committee-section">
            <div class="committee-header">
                <span class="material-symbols-outlined info-icon" title="${committeeData.description}">info</span>
                <h5>Committee: ${committeeName}</h5>
            </div>
            <div class="committee-website">
                <a href="${committeeData.websiteLink}" target="_blank" class="committee-website-button">
                    <span class="material-symbols-outlined">language</span>
                   Website
                </a>
            </div>
            <div class="committee-description">
                ${committeeData.description || 'No description available.'}
            </div>

        `;committeeData.legislators.forEach(legislator=>{const partyColor=legislator.Party==='Republican'?'red':'blue';const partyInitial=legislator.Party==='Republican'?'R':'D';const isChair=legislator.Position.toLowerCase()==='chair';html+=`
    <div class="info-item">
        <label>Name:</label>
        <span class="info-content">
            ${isChair ? '<span class="material-symbols-outlined chair-icon">person</span>' : ''}
            ${legislator.Name}
            <span class="party-pill ${partyColor}-pill">${partyInitial}</span>
        </span>
        <label>Position:</label><span class="info-content">${legislator.Position}</span>
        <label>Email:</label><span class="info-content"><a href="mailto:${legislator.Email}">${legislator.Email}</a></span>
        <label>Office Phone:</label><span class="info-content">${legislator['Office Phone #']}</span>
    </div>
    `;});html+='</div>';}
html+='</div>';return html;}
function closeLegislatorPanel(){document.getElementById('legislatorPanel').style.display='none';}
function setupSearch(){const searchInput=document.getElementById('legislatorSearch');const searchResults=document.getElementById('searchResults');searchInput.addEventListener('input',function(){const searchTerm=this.value.toLowerCase();if(searchTerm.length<2){searchResults.style.display='none';return;}
const matchingLegislators=data.filter(legislator=>legislator.Name.toLowerCase().includes(searchTerm));const matchingStates=geojsonLayer.getLayers().filter(layer=>layer.feature.properties.name.toLowerCase().includes(searchTerm));let resultsHTML='';if(matchingLegislators.length>0){resultsHTML+='<div class="search-category">Legislators</div>';resultsHTML+=matchingLegislators.map(legislator=>`
                        <div class="search-result-item" data-type="legislator" data-state="${legislator.State}">
                            ${legislator.Name} - ${legislator.State} - ${legislator['House/Senate']}
                        </div>
                    `).join('');}
if(matchingStates.length>0){resultsHTML+='<div class="search-category">States</div>';resultsHTML+=matchingStates.map(layer=>`
                        <div class="search-result-item" data-type="state" data-state="${layer.feature.properties.name}">
                            ${layer.feature.properties.name}
                        </div>
                    `).join('');}
if(resultsHTML){searchResults.innerHTML=resultsHTML;searchResults.style.display='block';}else{searchResults.innerHTML='<div class="search-result-item">No results found</div>';searchResults.style.display='block';}});searchResults.addEventListener('click',function(e){if(e.target.classList.contains('search-result-item')){const stateName=e.target.dataset.state;const type=e.target.dataset.type;if(stateName){geojsonLayer.eachLayer(function(layer){if(layer.feature.properties.name===stateName){var bounds=layer.getBounds();map.flyToBounds(bounds,{duration:1.5,maxZoom:6});updateLegislatorPanel(stateName);highlightState(stateName);updateMarker(stateName);}});}
searchResults.style.display='none';searchInput.value='';}});document.addEventListener('click',function(e){if(!searchWidget.contains(e.target)){searchResults.style.display='none';}});}
function highlightState(stateName){geojsonLayer.eachLayer(function(layer){if(layer.feature.properties.name===stateName){layer.setStyle({weight:5,color:'#2a6b37',dashArray:'',fillOpacity:0.7});}else{geojsonLayer.resetStyle(layer);}});}
function updateMarker(stateName){if(currentMarker){map.removeLayer(currentMarker);}
let latlng;if(stateName==='Florida'){latlng=L.latLng(28.537280744523006,-81.8381571309186);}else if(stateName==='Alaska'){latlng=L.latLng(66.11338507961604,-152.21651764735444);}else{geojsonLayer.eachLayer(function(layer){if(layer.feature.properties.name===stateName){var polygon=layer.feature.geometry;var point=turf.pointOnFeature(polygon);latlng=L.latLng(point.geometry.coordinates[1],point.geometry.coordinates[0]);}});}
if(latlng){currentMarker=L.marker(latlng,{icon:L.divIcon({className:'gps-icon',html:'<span class="material-icons-outlined">location_on</span>',iconSize:[24,24],iconAnchor:[12,12]})}).addTo(map);}}