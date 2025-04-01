const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
    let browser;
    let page;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--single-process",
                "--no-zygote"
            ],
        });
        page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        console.log("Navigating to https://socolivesq.com/...");
        await page.goto('https://socolivesq.com/', { waitUntil: 'networkidle2' });

        console.log("Simulating scroll to trigger content load...");
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(resolve => setTimeout(resolve, 5000)); // Replace waitFor

        console.log("Waiting for selector '.hot-content.all-content li'...");
        await page.waitForSelector('.hot-content.all-content li', { timeout: 60000 });

        console.log("Selector found, scraping data...");
        const scrapedData = await page.evaluate(() => {
            let data = [];
            document.querySelectorAll('.hot-content.all-content li').forEach(item => {
                let matchLink = item.querySelector('a')?.href || '';
                let imageUrl = item.querySelector('img.fm.live-cover')?.getAttribute('data-src') || '';
                let streamerName = item.querySelector('.bottom-title .name')?.innerText.trim() || 'Unknown';
                let viewerCount = item.querySelector('.bottom-title .num span')?.innerText.trim() || '0';
                let matchTitle = item.querySelector('h4.ellipsis')?.innerText.trim() || 'No Title';

                data.push({ matchLink, imageUrl, streamerName, viewerCount, matchTitle });
            });
            return data;
        });

        console.log("Scraped data:", JSON.stringify(scrapedData));
        res.json({ data: scrapedData });

    } catch (e) {
        console.error("Error:", e);
        if (page) {
            console.log("Page content at failure:", await page.content());
        } else {
            console.log("Page not initialized due to early failure.");
        }
        res.status(500).send(`Something went wrong while running: ${e.message}`);
    } finally {
        if (browser) await browser.close();
    }
};

module.exports = { scrapeLogic };