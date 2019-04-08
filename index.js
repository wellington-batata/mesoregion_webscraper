const hadless = require('puppeteer');
const fs = require('fs');
const jsonexport = require('jsonexport');
const urls = require('./urls.module');



let scraper = async (url) => {

    const browser = await hadless.launch({
        headless: false,
        defaultViewport: null
    });

    const page = await browser.newPage();
    await page.goto(url);
    await page.waitFor(1000);

    //Scraper
    const result = await page.evaluate(() => {
        let result = [];
        var elementsQtd = document.querySelectorAll('h3 + p + table').length;
        for (let index = 0; index < elementsQtd; index++) {
            const h3 = document.querySelectorAll('h3 span.mw-headline')[index].textContent;
            const table = document.querySelectorAll('h3 + p + table')[index];
            const lines = table.querySelectorAll('tbody tr').length;

            for (let t = 0; t < lines; t++) {
                const citie = table.querySelectorAll('tbody tr')[t].querySelector('td:last-child').textContent;
                let obj = {
                    ufname: null,
                    ufid: null,
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

const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}

asyncForEach(urls, async (url) => {
    await scraper(url.url).then((mesos) => {

        const fullMesos = mesos.map((item) => {
            item.ufid = url.ufid;
            item.ufname = url.uf;
            return item;
        });
        //windows: c:\temp\estado.csv
        const filename = '/temp/' + url.uf + '.csv';
        let csvData = null;

        jsonexport(fullMesos, {
            rowDelimiter: ';'
        }, function (err, csv) {
            if (err) return console.log(err);
            csvData = csv;
        });

        fs.writeFile(filename, csvData, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log('Arquivo ' + url.uf + '.csv salvo!');
        })
    })
})