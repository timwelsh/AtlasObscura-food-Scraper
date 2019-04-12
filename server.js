const cheerio = require("cheerio");
const axios = require("axios");

axios.get("https://www.atlasobscura.com/unique-food-drink").then(response => {
    const $ = cheerio.load(response.data);
    const results = [];

    $("a.content-card").each((i, element) => {
        // console.log(element);
        const title = $(element).children().children().children().text();
        const subtitle = $(element).children().find($('.content-card-subtitle-food')).text();  //this find() is slowing things down. Is there a better way?
        const link = $(element).children().children().attr("data-src");
        const site = "https://www.atlasobscura.com"
        const attribution = $(element).attr("href");
        const url = site + attribution;

        results.push({title, subtitle, link, url});
    });
    console.log(results);
});
