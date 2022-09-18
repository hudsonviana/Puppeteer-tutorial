const { Cluster } = require('puppeteer-cluster');
const fs = require('fs');

const urls = [
    'https://www.amazon.com.br/s?k=computador&sprefix=computa%2Caps%2C226&ref=nb_sb_ss_ts-doa-p_1_7',
    'https://www.amazon.com.br/s?k=liquidificador&sprefix=liqui%2Caps%2C241&ref=nb_sb_ss_ts-doa-p_1_5',
];

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 100,
    monitor: true,
    puppeteerOptions: {
        headless: false,
        defaultViewport: false,
        userDataDir: './tmp',
    },
    timeout: 60000,
  });

  cluster.on('taskerror', (err, data) => {
    console.log(`Error crawling ${data}: ${err.message}`);
  });

  await cluster.task(async ({ page, data: url }) => {
    // início do puppeteer
        await page.goto(url);
            
        let i = 1;
        let items = [];

        // criar o arquivo .csv
        fs.writeFile('produtos.csv', 'id;title;price;image\n', err => {
            if (err) throw new Error('something went wrong!');
            // console.log('Arquivo csv criado!');
        });

        // loop em todos os handles
        let isBtnDisabled = false;
        while (!isBtnDisabled) {
            
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
            // console.log(is_disabled);
                
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
    // fim do puppeteer
  });

//   let x = 0;
//   while (x <= 400) {
//     await cluster.queue(url);
//   }

  for (const url of urls) {
    await cluster.queue(url);
  }

  await cluster.idle();
  await cluster.close();
})();
