const hadless = require("puppeteer");

let scraper = async () => {
    const browser = await hadless.launch({
        headless: false,
        defaultViewport: null
    });
    const page = await browser.newPage();
    await page.goto("https://pt.wikipedia.org/wiki/Lista_de_mesorregi%C3%B5es_e_microrregi%C3%B5es_de_Goi%C3%A1s");
    await page.waitFor(1000);

    //Scraper
    const result = await page.evaluate(() => {
        let result = [];
        var elementsQtd = document.querySelectorAll('h3 + table').length;
        for (let index = 0; index < elementsQtd; index++) {
            const h3 = document.querySelectorAll('h3 span.mw-headline')[index].textContent;
            const table = document.querySelectorAll('h3 + table')[index];
            const lines = table.querySelectorAll('tbody tr').length;

            for (let t = 0; t < lines; t++) {
                const citie = table.querySelectorAll('tbody tr')[t].querySelector('td:last-child').textContent;
                let obj = {
                    meso: h3,
                    citie: citie.replace('\n', '')
                }
                result.push(obj);
            }
        }
        return result;
    });

    await browser.close();
    return result;
};

scraper().then((mesos) => {
    console.log(mesos[0]);
});