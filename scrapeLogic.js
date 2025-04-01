const puppeteer = require("puppeteer")
require("dotenv").config()

const scrapeLogic = async(res) => {
    const browser = await puppeteer.launch({
        headless:'new',
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote"
        ],
    });
    try {
        const page = await browser.newPage();

        await page.goto('https://socolivesq.com/', { waitUntil: 'networkidle2' });
        await page.waitForSelector('.hot-content.all-content li');
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
        res.json({ data: scrapedData });
    } catch (e) {
        console.error(e);
        res.status(500).send(`Something went wrong while running: ${e.message}`);
    } finally {
        await browser.close();
    }
}

module.exports={scrapeLogic}