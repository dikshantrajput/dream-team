const fs = require('fs').promises;
const puppeteer = require('puppeteer');

// Function to fetch squad details for a given team URL
async function fetchSquadDetails(teamUrl) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        // Navigate to the team URL
        await page.goto(teamUrl);

         // Wait for the anchor tag to appear on the page
         await page.waitForSelector('a.submenu[data-id="teams"]');

         // Click on the anchor tag using evaluate
        //  await page.evaluate(() => {
        //      const anchor = document.querySelector('a.submenu[data-id="teams"]');
        //      anchor.click();
        //  });

        await page.click('a.submenu[data-id="teams"]');
        
        // Wait for navigation to complete
        await page.waitForNavigation();

        // Extract content from the page
        const content = await page.content();
        console.log(content);

        
    } catch (error) {
        console.error('Error fetching squad details:', error);
        return null;
    } finally {
        await browser.close();
    }
}

// Function to save squad details to a JSON file
async function saveSquadDetailsToJson(teamName, squadDetails) {
    try {
      console.log(JSON.stringify(squadDetails, null, 2));
        // const fileName = `${teamName}.json`;
        // await fs.writeFile(fileName, JSON.stringify(squadDetails, null, 2));
        // console.log(`Squad details for ${teamName} saved to ${fileName}`);
    } catch (error) {
        console.error(`Error saving squad details for ${teamName} to JSON file:`, error);
    }
}

// Function to iterate over each team and fetch squad details
async function fetchAllTeamSquadDetails(teamLinks) {
    for (const [teamName, hrefs] of Object.entries(teamLinks)) {
        console.log(`Fetching squad details for ${teamName}...`);
        const squadDetails = {
            batsmen: [],
            allRounders: [],
            bowlers: []
        };

        // Fetch squad details for each category of players
        for (const [category, urls] of Object.entries(hrefs)) {
            console.log(`Fetching ${category} squad details...`);
            for (const url of urls) {
                const details = await fetchSquadDetails(url);
                if (details) {
                    squadDetails[category].push({ url, details });
                }
            }
        }

        // Save squad details to JSON file
        await saveSquadDetailsToJson(teamName, squadDetails);
    }
}

// Example object with team names and their corresponding player links
const teamLinks = {
    'sunrisers-hyderabad': {
        batsmen: [
            'https://www.iplt20.com/teams/sunrisers-hyderabad/squad-details/19352',
            // Other batsmen URLs...
        ],
        allRounders: [
            // Other all-rounders URLs...
        ],
        bowlers: [
            // Other bowlers URLs...
        ]
    },
    // Other team entries...
};

// Call function to fetch and save squad details for all teams
fetchAllTeamSquadDetails(teamLinks)
    .then(() => {
        console.log('All squad details saved to JSON files.');
    })
    .catch(error => {
        console.error('Error:', error);
    });
