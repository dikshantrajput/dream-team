const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false }); // Launch browser in non-headless mode
    const page = await browser.newPage();

    try {
        // Navigate the page to a URL
        await page.goto('https://www.iplt20.com/match/2024/1357', { waitUntil: 'domcontentloaded' }); // Wait until DOM content is loaded

        // Function to check if the desired count of list items is reached
        const desiredItemCount = 11;
        let listItemsCount = 0;
        while (listItemsCount < desiredItemCount) {
            const listItems = await page.$$('ul.fixtureSquad-list li.fixtureSquad-item');
            listItemsCount = listItems.length;
            if (listItemsCount < desiredItemCount) {
                await page.waitForTimeout(1000); // Wait for 1 second before checking again
            }
        }

        // Extract name and anchor href from list items using evaluate
        const playerInfo = await page.evaluate(() => {
            const listItems = document.querySelectorAll('ul.fixtureSquad-list li.fixtureSquad-item');
            const playerInfoArray = [];
            listItems.forEach(item => {
                const name = item.querySelector('.fx-ply-name a').innerText.trim();
                const href = item.querySelector('.fx-ply-name a').getAttribute('href');
                playerInfoArray.push({ name, href });
            });
            return playerInfoArray;
        });

        console.log(playerInfo);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
})();
