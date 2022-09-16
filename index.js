const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://www.fundamentus.com.br/ultimos-resultados.php');
    await page.screenshot({ path: 'fundamentos.png', fullPage: true });

    await browser.close();
})();
