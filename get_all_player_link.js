const axios = require('axios');
const cheerio = require('cheerio');

// URL to fetch HTML content from
const url = 'https://www.iplt20.com/teams/delhi-capitals';

// Function to fetch HTML content using Axios
async function fetchHTML(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching HTML:', error);
    }
}

// Function to extract href attributes using Cheerio
function extractHrefs(html) {
    const $ = cheerio.load(html);
    const batHrefs = [];
    const bowlHrefs = [];
    const arHrefs = [];

    // Find all anchor tags within the list
    $('#identifiercls0 li a').each((index, element) => {
        // Extract the href attribute from the anchor tag and push it to hrefs array
        const href = $(element).attr('href');
        const playerName = $(element).find('.ih-p-name h2').text().trim();
        if (href && playerName) {
            batHrefs.push({ href, playerName });
        }
    });

    $('#identifiercls1 li a').each((index, element) => {
        // Extract the href attribute from the anchor tag and push it to hrefs array
        arHrefs.push($(element).attr('href'));
    });

    $('#identifiercls2 li a').each((index, element) => {
        // Extract the href attribute from the anchor tag and push it to hrefs array
        bowlHrefs.push($(element).attr('href'));
    });

    return {batHrefs, arHrefs, bowlHrefs};
}

// Main function to fetch HTML and extract href attributes
async function main() {
    try {
        // Fetch HTML content from the provided URL
        const html = await fetchHTML(url);
        
        // Extract href attributes from the fetched HTML
        const hrefs = extractHrefs(html);

        // Log the extracted hrefs
        console.log(hrefs);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Call the main function
main();
