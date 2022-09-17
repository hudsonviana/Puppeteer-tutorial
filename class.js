const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://www.amazon.com.br/s?k=computador&page=7&qid=1663440474&ref=sr_pg_7', {waitUntil: 'load'});

    const is_disabled = await page.$('.s-pagination-item.s-pagination-next.s-pagination-disabled') !== null;

    // console.log(is_disabled);
    
    await browser.close();
})();
