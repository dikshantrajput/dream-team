const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

// const url = 'https://www.espncricinfo.com/series/indian-premier-league-2024-1410320/gujarat-titans-vs-mumbai-indians-5th-match-1422123/match-playing-xi';
const url = process.argv[2];

// Get the path part of the URL
const u = url.split('/')
u.pop()
const path = u.pop();

// Split the path at 'vs' to get left and right parts
const [leftText, rightText] = path.split('-vs-');

// Extract only the substring before the number on the right side
const rightSideBeforeNumber = rightText.match(/^(.*?)(?=\d)/)[0];

const evenTeam = leftText.replace(/-/g, ' ')
const oddTeam = rightSideBeforeNumber.replace(/-/g, ' ');

// Make a GET request to fetch the HTML content
axios.get(url)
  .then(async response => {
    // Load the HTML content into Cheerio
    const $ = cheerio.load(response.data);

    // Select the player names
    const playerNames = [];

    // Assuming the player names are wrapped in <span> tags with class "ds-text-tight-m"
    $('td span.ds-text-tight-m').each((index, element) => {
      if (index < 22) { // Get the first 22 elements
        const playerName = $(element).text().trim().replace(/[^\w\s]/gi, ''); // Remove special characters
        playerNames.push(playerName);
      }
    });

    // Filter out odd and even index players
    const evenIndexPlayers = playerNames.filter((_, index) => index % 2 === 0);
    const oddIndexPlayers = playerNames.filter((_, index) => index % 2 !== 0);

    const result = {
    }
    if((evenIndexPlayers.length == 11) && (oddIndexPlayers.length == 11)){
      result[evenTeam] = evenIndexPlayers
      result[oddTeam] = oddIndexPlayers

      console.log(result);
      const fileName = `${path}.json`;
      await fs.writeFile(fileName, JSON.stringify(result, null, 2));
      console.log(`Playing xi saved`);
    }

  })
  .catch(error => {
    console.error('Error fetching the page:', error);
  });
