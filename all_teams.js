const axios = require('axios');
const cheerio = require('cheerio');

// URL to fetch HTML content from
const url = 'https://www.iplt20.com/teams';

// Function to fetch HTML content using Axios
async function fetchHTML(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching HTML:', error);
    }
}

// Function to extract anchor tags using Cheerio
function extractAnchorTags(html) {
    const $ = cheerio.load(html);
    const anchorTags = [];

    // Find all anchor tags in the HTML
    $('.vn-teamsInnerWrp li a').each((index, element) => {
        // Extract the href attribute from the anchor tag and push it to anchorTags array
        const href = $(element).attr('href');
        if (href) {
            anchorTags.push(href);
        }
    });

    return anchorTags;
}

// Main function to fetch HTML and extract anchor tags
async function main() {
    try {
        // Fetch HTML content from the provided URL
        const html = await fetchHTML(url);
        
        // Extract anchor tags from the fetched HTML
        const anchorTags = extractAnchorTags(html);

        // Log the extracted anchor tags
        console.log(anchorTags);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Call the main function
main();
