document.addEventListener('DOMContentLoaded', (event) => {
    let parsedStatsData = [];
    let parsedImageData = {};

    function loadImagesData() {
        return fetch('images9.csv')  
            .then(response => response.text())
            .then(csvText => {
                const rows = csvText.split('\n');
                rows.slice(1).forEach(row => {
                    const [tokenId, imageUrl] = row.split(',');
                    parsedImageData[tokenId.trim()] = imageUrl.trim();
                });
            })
            .catch(error => {
                console.error('Error loading images CSV:', error);
            });
    }

    fetch('nft_stats_simplified.csv')  
        .then(response => response.text())
        .then(csvText => {
            parsedStatsData = parseCSV(csvText);
            return loadImagesData();
        })
        .then(() => {
            console.log('Stats and Images data loaded');
            attachEventListeners();
        })
        .catch(error => {
            console.error('Error loading stats CSV:', error);
        });

   
    function attachEventListeners() {
        const buttons = document.querySelectorAll('.add-kong-button');
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                const input = this.previousElementSibling;
                const kongId = input.value;

                if (kongId) {
                    const kongContainer = this.parentElement;

                    
                    const nft = findNFTById(kongId);
                    if (nft) {
                        displayNFTStats(kongContainer, nft);
                    } else {
                        alert('No Kong found with that ID.');
                    }

                    
                    const imageUrl = parsedImageData[kongId];
                    if (imageUrl) {
                        const imageDiv = kongContainer.querySelector('.kong-image');
                        imageDiv.style.backgroundImage = `url('${imageUrl}')`;
                        imageDiv.style.backgroundSize = 'cover';
                    } else {
                        alert('No image found for this Kong ID.');
                    }
                } else {
                    alert('Please enter a Kong ID.');
                }
            });
        });
    }

    // Function to find an NFT by token_id
    function findNFTById(kongId) {
        return parsedStatsData.find(nft => nft.token_id === kongId);
    }

    // Function to update the display with NFT stats
    function displayNFTStats(container, stats) {
        container.querySelector('.shooting-stat').textContent = stats['Shooting'];
        container.querySelector('.defense-stat').textContent = stats['Defense'];
        container.querySelector('.vision-stat').textContent = stats['Vision'];
        container.querySelector('.finish-stat').textContent = stats['Finish'];
        container.querySelector('.total-stat').textContent = stats['Total Boost'];
    }

    // Function to parse CSV text into an array of objects
    function parseCSV(csvText) {
        let lines = csvText.split('\n');
        lines = lines.filter(line => line.trim() !== '');
        const headers = lines.shift().split(',').map(header => header.trim());

        return lines.map(line => {
            const values = line.split(',').map(value => value.trim());
            let nft = {};
            headers.forEach((header, index) => {
                nft[header] = values[index];
            });
            return nft;
        });
    }

    
    // Function to handle 'Calculate Team Total' button click
document.getElementById('calculate-team-total-button').addEventListener('click', function() {
    let teamDefense = 0, teamFinish = 0, teamShooting = 0, teamVision = 0;

    // Iterate over each 'kong' article element
    document.querySelectorAll('.kong').forEach(kong => {
        const defense = parseInt(kong.querySelector('.defense-stat').textContent) || 0;
        const finish = parseInt(kong.querySelector('.finish-stat').textContent) || 0;
        const shooting = parseInt(kong.querySelector('.shooting-stat').textContent) || 0;
        const vision = parseInt(kong.querySelector('.vision-stat').textContent) || 0;

        // Summing up the stats for the team
        teamDefense += defense;
        teamFinish += finish;
        teamShooting += shooting;
        teamVision += vision;
    });

    // Display the calculated team totals
    document.getElementById('team-defense').textContent = teamDefense;
    document.getElementById('team-finish').textContent = teamFinish;
    document.getElementById('team-shooting').textContent = teamShooting;
    document.getElementById('team-vision').textContent = teamVision;
    document.getElementById('team-total').textContent = teamDefense + teamFinish + teamShooting + teamVision;
});

// Global array to store team data
let teamsData = [];

// Function to add the current team to the chart
function addTeamToChart() {
    if (teamsData.length < 3) { // Limit to 3 teams
        const team = {
            defense: parseInt(document.getElementById('team-defense').textContent),
            finish: parseInt(document.getElementById('team-finish').textContent),
            shooting: parseInt(document.getElementById('team-shooting').textContent),
            vision: parseInt(document.getElementById('team-vision').textContent)
        };
        teamsData.push(team);
        updateChartDisplay();
    } else {
        alert('Maximum of 3 teams can be added to the chart.');
    }
}

// Function to remove the last team from the chart
function removeTeamFromChart() {
    teamsData.pop();
    updateChartDisplay();
}


// Function to update the chart display
function updateChartDisplay() {
    let table = '<table><tr><th>Team</th><th>Defense</th><th>Finish</th><th>Shooting</th><th>Vision</th><th>Total</th></tr>';
    teamsData.forEach((team, index) => {
        const total = team.defense + team.finish + team.shooting + team.vision; // Calculate the total
        table += `<tr>
                    <td>Team ${index + 1}</td>
                    <td>${team.defense}</td>
                    <td>${team.finish}</td>
                    <td>${team.shooting}</td>
                    <td>${team.vision}</td>
                    <td>${total}</td> <!-- Display the total -->
                  </tr>`;
    });
    table += '</table>';
    document.getElementById('teams-chart').innerHTML = table;
}



document.getElementById('add-team-button').addEventListener('click', addTeamToChart);
document.getElementById('remove-team-button').addEventListener('click', removeTeamFromChart);


});
