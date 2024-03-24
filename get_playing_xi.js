const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.espncricinfo.com/series/indian-premier-league-2024-1410320/gujarat-titans-vs-mumbai-indians-5th-match-1422123/match-playing-xi';

// Get the path part of the URL
const u = url.split('/')
u.pop()
const path = u.pop();

// Split the path at 'vs' to get left and right parts
const [leftText, rightText] = path.split('-vs-');

// Extract only the substring before the number on the right side
const rightSideBeforeNumber = rightText.match(/^(.*?)(?=\d)/)[0];

const oddTeam = leftText.replace(/-/g, ' ')
const evenTeam = rightSideBeforeNumber.replace(/-/g, ' ');


// Make a GET request to fetch the HTML content
axios.get(url)
  .then(response => {
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

    console.log("Even Index Players:", evenIndexPlayers);
    console.log("Odd Index Players:", oddIndexPlayers);
  })
  .catch(error => {
    console.error('Error fetching the page:', error);
  });
