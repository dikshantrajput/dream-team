const fs = require('fs').promises;
const axios = require('axios');
const cheerio = require('cheerio');

// Function to extract dates, match details, and times
function extractMatches(html) {
    const $ = cheerio.load(html);
    const matches = [];

    // Extracting date, match details, and time
    $('.cb-series-matches').each((index, element) => {
        const t = $(element).find('.cb-srs-mtchs-tm span.schedule-date');
        const timestamp = parseInt(t.attr('timestamp'))
        const href = $(element).find('.cb-col-60.cb-col.cb-srs-mtchs-tm > a').attr('href');
        const date = new Date(timestamp);
        // Format date
        const optionsDate = { day: '2-digit', month: 'long', year: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', optionsDate); // Example: "22 March 2024"

        // Format time
        const optionsTime = { hour: 'numeric', minute: '2-digit', hour12: true };
        const formattedTime = date.toLocaleTimeString('en-US', optionsTime); // Example: "8:00 PM"

        const teamsElement = $(element).find('.cb-srs-mtchs-tm').eq(0);
        const teams = teamsElement.find('span').eq(0).text().trim();
        const title = teamsElement.find('a').eq(0).text().trim();
        const venue = teamsElement.find('.text-gray').eq(0).text().trim();

        matches.push({ id: href.split('/')[href.split('/').length - 1], date: formattedDate, timestamp, teams, title, venue, startTime: formattedTime });
    });

    return matches;
}

// Fetch HTML content using axios
axios.get('https://www.cricbuzz.com/cricket-series/7607/indian-premier-league-2024/matches')
    .then(async response => {
        const htmlContent = response.data;
        // Extract matches
        const extractedMatches = extractMatches(htmlContent);
        const fileName = `./matches/match_fixtures.json`;
        await fs.writeFile(fileName, JSON.stringify(extractedMatches, null, 2));
        console.log(`Fixtures saved`);
    })
    .catch(error => {
        console.error('Error fetching HTML:', error);
    });
