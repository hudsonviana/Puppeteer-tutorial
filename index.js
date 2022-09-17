const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: false,
        userDataDir: './tmp'
    });
    const page = await browser.newPage();

    await page.goto('https://www.amazon.com.br/s?k=amazonbasics&__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&ref=nb_sb_noss');
    
    // chamar o handle (a div que contém todos os produtos)
    const productHandles = await page.$$('div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item');

    let i = 0;
    let items = [];

    // loop em todos os handles
    for (const productHandle of productHandles) {

        let title = 'Null';
        let price = 'Null';
        let image = 'Null';

        try {       
            title = await page.evaluate(el => el.querySelector("h2 > a > span").textContent, productHandle);
        } catch (error) {}

        try { 
            price = await page.evaluate(el => el.querySelector(".a-price > .a-offscreen").textContent,    productHandle);
        } catch (error) {}

        try { 
            image = await page.evaluate(el => el.querySelector(".s-image").getAttribute("src"), productHandle);
        } catch (error) {}

        if (title !== 'Null') {
            let id = i++;
            items.push({id, title, price, image});
        }
    }

    // Escrever os dados em um arquivo local (json)
    fs.writeFile('produtos.json', JSON.stringify(items, null, 2), err => {
        if (err) throw new Error('something went wrong!');
        console.log('well done!');
    });

    // console.log(items);

    await browser.close();
})();
