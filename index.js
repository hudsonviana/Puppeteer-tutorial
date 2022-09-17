const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: false,
        userDataDir: './tmp'
    });
    const page = await browser.newPage();

    await page.goto('https://www.amazon.com.br/s?k=computador&qid=1663442012&ref=sr_pg_1');
        
    let i = 1;
    let items = [];

    // criar o arquivo .csv
    fs.writeFile('produtos.csv', 'id;title;price;image\n', err => {
        if (err) throw new Error('something went wrong!');
        console.log('Arquivo csv criado!');
    });

    // loop em todos os handles
    let isBtnDisabled = false;
    while (!isBtnDisabled) {
        
        // await page.waitForSelector('div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item');
        await page.waitForSelector('[cel_widget_id="MAIN-SEARCH_RESULTS-6"]');

        // chamar o handle (a div que contém todos os produtos)
        const productHandles = await page.$$('div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item');

        for (const productHandle of productHandles) {
            let title = 'Null';
            let price = 'Null';
            let image = 'Null';

            try {       
                title = await page.evaluate(el => el.querySelector("h2 > a > span").textContent, productHandle);
            } catch (error) {}

            try { 
                price = await page.evaluate(el => el.querySelector(".a-price > .a-offscreen").textContent, productHandle);
            } catch (error) {}

            try { 
                image = await page.evaluate(el => el.querySelector(".s-image").getAttribute("src"), productHandle);
            } catch (error) {}

            if (title !== 'Null') {
                let id = i++;
                items.push({id, title, price, image});

                // Escrever os dados em um arquivo .csv
                fs.appendFile('produtos.csv', `${id};${title};${price};${image}\n`, err => {
                    if (err) throw new Error('something went wrong!');
                    // console.log('Saved!');
                });

            }
        }

        // código para passar de página
        await page.waitForSelector('.s-pagination-item.s-pagination-next', {visible: true});
                
        const is_disabled = await page.$('.s-pagination-item.s-pagination-next.s-pagination-disabled') !== null;
        console.log(is_disabled);
            
        isBtnDisabled = is_disabled;

        if (!is_disabled) {
            await Promise.all([
                page.click('a.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator'),
                page.waitForNavigation({ waitUntil: 'networkidle2' })
            ]);
        }
    }

    // Escrever os dados em um arquivo local (json)
    fs.writeFile('produtos_totais.json', JSON.stringify(items, null, 2), err => {
        if (err) throw new Error('something went wrong!');
        console.log('well done!');
    });

    // console.log(items);

    await browser.close();
})();
