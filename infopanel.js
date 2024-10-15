// infopanel.js

function updateLegislatorPanel(stateName) {
    var legislatorPanel = document.getElementById('legislatorPanel');
    let panelContent = `
        <button id="closePanelButton" class="close-button">
            <span class="material-icons-outlined">close</span>
        </button>
        <h3>Legislators in ${stateName}</h3>
    `;

    if (typeof data === 'undefined') {
        console.error("Legislator data is not loaded. Make sure data.js is properly linked.");
        panelContent += "<p>Error: Legislator data not available</p>";
    } else {
        var legislators = data.filter(d => d.State === stateName);
        if (legislators.length === 0) {
            panelContent += "<p>No legislator data available for this state.</p>";
        } else {
            let stateWebsite = legislators[0]['State Website'];
            panelContent += `
                <div class="state-website">
                    <span class="material-symbols-outlined">language</span>
                    <a href="${stateWebsite}" target="_blank">${stateWebsite}</a>
                </div>
            `;

            var houseLegislators = legislators.filter(l => l['House/Senate'] === 'House');
            var senateLegislators = legislators.filter(l => l['House/Senate'] === 'Senate');

            if (houseLegislators.length > 0) {
                panelContent += createSection('House', houseLegislators);
            }
            if (senateLegislators.length > 0) {
                panelContent += createSection('Senate', senateLegislators);
            }
        }
    }

    legislatorPanel.innerHTML = panelContent;
    legislatorPanel.style.display = 'block';
    updateMarker(stateName);

    document.getElementById('closePanelButton').addEventListener('click', closeLegislatorPanel);

    document.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('click', function() {
            this.querySelector('.chevron').classList.toggle('up');
            this.nextElementSibling.classList.toggle('collapsed');
        });
    });
}

function createSection(title, legislators) {
    let logoUrl = title === 'House' ? 'https://jackson.house.gov/images/seal.png' : 'https://www.fpri.org/wp-content/uploads/2017/01/us-senate-seal-400x400.png';
    let html = `
    <div class="section-header">
        <div class="section-title">
            <img src="${logoUrl}" alt="${title} logo" class="section-logo">
            <h4>${title}</h4>
        </div>
        <span class="material-icons-outlined chevron">expand_circle_down</span>
    </div>
    <div class="section-content collapsed">
    `;

    let committeesMap = {};
    legislators.forEach(legislator => {
        if (!committeesMap[legislator.Committee]) {
            committeesMap[legislator.Committee] = {
                description: legislator['Definition website'],
                websiteLink: legislator['COMMITTEE WEBSITE LINK'],
                legislators: []
            };
        }
        committeesMap[legislator.Committee].legislators.push(legislator);
    });

    for (let [committeeName, committeeData] of Object.entries(committeesMap)) {
        html += `
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
        `;

        committeeData.legislators.forEach(legislator => {
            const partyColor = legislator.Party === 'Republican' ? 'red' : 'blue';
            const partyInitial = legislator.Party === 'Republican' ? 'R' : 'D';
            const isChair = legislator.Position.toLowerCase() === 'chair';
            html += `
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
    `;
        });

        html += '</div>';
    }

    html += '</div>';
    return html;
}

function closeLegislatorPanel() {
    document.getElementById('legislatorPanel').style.display = 'none';
}