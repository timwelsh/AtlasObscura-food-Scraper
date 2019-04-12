const cheerio = require("cheerio");
const axios = require("axios");
const express = require("express");
const mongojs = require("mongojs");
const app = express();
const databaseUrl = "atlasObscura";


// Routes
app.get("/", (req, res) => {
    res.send("Hello World");
});

// Route to retrieve all data from database
app.get("/all", (req, res) => {
    db.foodList.find({}, (error, found) => {
        if (error) {
            console.log(error);
        } else {
            res.json(found);
        };
    });
});

// Route to scrape data from site and load into mongo db
app.get("/foodall", (req, res) => {
    const collections = ["foodList"];
    const db = mongojs(databaseUrl, collections);
    db.on("error", error => {
        console.log("Database Error: ", error);
    });
    axios.get("https://www.atlasobscura.com/unique-food-drink").then(response => {
        const $ = cheerio.load(response.data);
        const results = [];

        $("a.content-card").each((i, element) => {
            // console.log(element);
            const title = $(element).children().children().children().text();
            const subtitle = $(element).children().find($('.content-card-subtitle-food')).text();  //this find() is slowing things down. Is there a better way?
            const image = $(element).children().children().attr("data-src");
            const site = "https://www.atlasobscura.com"
            const attribution = $(element).attr("href");
            const url = site + attribution;

            if (title && subtitle && image && url) {
                try {
                    db.foodList.insertMany({
                        title: title,
                        subtitle: subtitle,
                        image: image,
                        url, url
                    },
                    (err, inserted) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(inserted);
                        }
                    });
                } catch (e) {
                    console.log("Catch error: " + e);
                }
            }
            // results.push({title, subtitle, image, url});
        });
        // console.log(results);
    });
    // Send scrape complete message to browser
    res.send("Scrape Complete");
});

app.get("/mexico", (req, res) => {
    axios.get("https://www.atlasobscura.com/things-to-do/mexico/places").then(response => {
        const collections = ["mexicoList"];
        const db = mongojs(databaseUrl, collections);
        db.on("error", error => {
            console.log("Database Error: ", error);
        });
        const $ = cheerio.load(response.data);
        const results = [];
        $("a.content-card").each((i, element) => {
            // console.log(element);
            const title = $(element).children().children().children().text();
            const subtitle = $(element).children().find($('.content-card-subtitle')).text(); 
            const image = $(element).children().children().attr("data-src");
            const site = "https://www.atlasobscura.com"
            const attribution = $(element).attr("href");
            const url = site + attribution;

            // if (title && subtitle && image && url) {
            //     // try {
            //         db.foodList.insert({
            //             title: title,
            //             subtitle: subtitle,
            //             image: image,
            //             url, url
            //         },
            //         (err, inserted) => {
            //             if (err) {
            //                 console.log(err);
            //             } else {
            //                 console.log(inserted);
            //             }
            //         });
            //     // } catch (e) {
            //     //     console.log("Catch error: " + e);
            //     // }
            // }
            results.push({title, subtitle, image, url});
        });
        console.log(results);
    });
    // Send scrape complete message to browser
    res.send("Mexico Scrape Complete");
});

app.listen(3300, () => {
    console.log("App is running on port 3300");
});
