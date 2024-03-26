const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

// Function to fetch HTML content using Axios
async function fetchHTML(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching HTML:', error);
    }
}

// Function to extract team links using Cheerio
function extractTeamLinks(html) {
    const $ = cheerio.load(html);
    const teamLinks = [];

    // Find all anchor tags with team links
    $('.vn-teamsInnerWrp li a').each((index, element) => {
        const href = $(element).attr('href');
        if (href) {
            teamLinks.push(href);
        }
    });

    return teamLinks;
}

// Function to extract player links for a given team URL using Cheerio
async function extractPlayerLinksForTeam(teamUrl) {
    try {
        const html = await fetchHTML(teamUrl);
        const $ = cheerio.load(html);
        const playerLinks = {
            batsmen: [],
            allRounder: [],
            bowler: []
        };

        $('#identifiercls0 li a').each((index, element) => {
            // Extract the href attribute from the anchor tag and push it to hrefs array
            const href = $(element).attr('href');
            const playerName = $(element).find('.ih-p-name h2').text().trim();
            if (href && playerName) {
                playerLinks.batsmen.push({ href, playerName });
            }
        });

        $('#identifiercls1 li a').each((index, element) => {
            // Extract the href attribute from the anchor tag and push it to hrefs array
            const href = $(element).attr('href');
            const playerName = $(element).find('.ih-p-name h2').text().trim();
            if (href && playerName) {
                playerLinks.allRounder.push({ href, playerName });
            }
        });

        $('#identifiercls2 li a').each((index, element) => {
            // Extract the href attribute from the anchor tag and push it to hrefs array
            const href = $(element).attr('href');
            const playerName = $(element).find('.ih-p-name h2').text().trim();
            if (href && playerName) {
                playerLinks.bowler.push({ href, playerName });
            }
        });

        return playerLinks;
    } catch (error) {
        throw new Error(`Error extracting player links for ${teamUrl}: ${error}`);
    }
}

// Function to fetch squad details for a given player URL using Puppeteer
async function fetchSquadDetails(teamUrl) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        // Navigate to the team URL
        await page.goto(teamUrl);

        // Extract squad details from the table
        const battingAndFieldingTableData = await page.evaluate(() => {
            const table = document.querySelectorAll('table.sm-pp-table')[0];
            const rows = Array.from(table.querySelectorAll('tr'));
            return rows.filter((i,index) => index < 2).map(row => {
                const cells = Array.from(row.querySelectorAll('th, td'));
                return cells.filter((i, idx) => idx < 8).map(cell => cell.textContent.trim());
            });
        });

        const bowlingTableData = await page.evaluate(() => {
          const table = document.querySelectorAll('table.sm-pp-table')[1];
          const rows = Array.from(table.querySelectorAll('tr'));
          return rows.filter((i,index) => index < 2).map(row => {
              const cells = Array.from(row.querySelectorAll('th, td'));
              return cells.filter((i, idx) => idx < 8).map(cell => cell.textContent.trim());
          });
      });

        return {battingAndFieldingTableData, bowlingTableData};
    } catch (error) {
        console.error('Error fetching squad details:', error);
        return null;
    } finally {
        await browser.close();
    }
}

// Function to merge batting and bowling data arrays for each player
function mergeData(inputData) {
    const mergedData = {};

    // Iterate over each player type (batsmen, allRounder, bowler)
    for (const playerType in inputData) {
        mergedData[playerType] = [];

        // Iterate over each player in the current player type
        inputData[playerType].forEach(player => {
            const mergedPlayer = {
                playerName: player.playerName,
                details: {
                    combinedData: []
                }
            };

            const battingData = player.details.battingAndFieldingTableData;
            const bowlingData = player.details.bowlingTableData;

            // Merge the batting and bowling data arrays
            const mergedPlayerData = mergeBattingAndBowlingData(battingData, bowlingData);

            // Assign the merged data to the current player
            mergedPlayer.details.combinedData = mergedPlayerData;

            // Push the player with merged data to the mergedData array
            mergedData[playerType].push(mergedPlayer);
        });
    }

    return mergedData;
}

// Function to merge batting and bowling data arrays
function mergeBattingAndBowlingData(battingData, bowlingData) {
    const mergedData = [];

    // Push the header (first element) of battingData into the mergedData array
    mergedData.push([...battingData[0], ...bowlingData[0].slice(1)]);

    // Loop through the battingData array starting from the second element
    for (let i = 1; i < battingData.length; i++) {
        // Merge the elements of battingData and bowlingData for each player
        const mergedPlayerData = [...battingData[i], ...bowlingData[i].slice(1)];
        // Push the merged data into the mergedData array
        mergedData.push(mergedPlayerData);
    }

    return mergedData;
}

// Function to save squad details to a JSON file
async function saveSquadDetailsToJson(teamName, squadDetails) {
    try {
        const fileName = `${teamName}.json`;
        const mergedData = mergeData(squadDetails);
        await fs.writeFile(fileName, JSON.stringify(mergedData));
        console.log(`Squad details for ${teamName} saved to ${fileName}`);
    } catch (error) {
        console.error(`Error saving squad details for ${teamName} to JSON file:`, error);
    }
}

// Main function to fetch team links and then player links for each team
async function main() {
    try {
        // Fetch HTML content from the provided URL to get team links
        const teamsUrl = 'https://www.iplt20.com/teams';
        const teamsHtml = await fetchHTML(teamsUrl);
        
        // Extract team links from the fetched HTML
        const teamLinks = extractTeamLinks(teamsHtml);

        // Fetch player links for each team
        const teamPlayerLinks = {};
        for (const teamLink of teamLinks) {
            const playerLinks = await extractPlayerLinksForTeam(teamLink);
            teamPlayerLinks[teamLink.split("/").pop()] = playerLinks;
        }

        // Fetch squad details for each player link and save to JSON files
        for (const [teamName, playerLinks] of Object.entries(teamPlayerLinks)) {
            console.log(`Fetching squad details for ${teamName}...`);
            const squadDetails = {};
            for (const [category, urls] of Object.entries(playerLinks)) {
                console.log(`Fetching ${category} squad details...`);
                squadDetails[category] = [];
                for (const { href, playerName } of urls) {
                    const details = await fetchSquadDetails(href);
                    if (details) {
                        squadDetails[category].push({ playerName, details });
                    }
                }
            }
            await saveSquadDetailsToJson(teamName, squadDetails);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Call the main function
main();
