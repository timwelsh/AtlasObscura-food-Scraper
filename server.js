const cheerio = require("cheerio");
const axios = require("axios");
const express = require("express");
const mongojs = require("mongojs");
const mongoose = require("mongoose");
const logger = require("morgan");
const app = express();
const databaseUrl = "atlasObscura";
// Require all models
const db = require("./models");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
// var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
// mongoose.connect(MONGODB_URI);

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/destinations", { useNewUrlParser: true });

// Routes
app.get("/", (req, res) => {
    res.send("Hello World");
});

// Route to retrieve all data from database
app.get("/all", (req, res) => {
    const collections = ["foodList"];
    const db = mongojs(databaseUrl, collections);
    db.foodList.find({}, (error, found) => {
        if (error) {
            console.log(error);
        } else {
            res.json(found);
        };
    });
});

// Route to scrape data from site and load into mongo db

// app.get("/foodall", (req, res) => {
//     const collections = ["foodList"];
//     const db = mongojs(databaseUrl, collections);
//     db.on("error", error => {
//         console.log("Database Error: ", error);
//     });
//     axios.get("https://www.atlasobscura.com/unique-food-drink").then(response => {
//         const $ = cheerio.load(response.data);
//         const results = [];

//         $("a.content-card").each((i, element) => {
//             // console.log(element);
//             const title = $(element).children().children().children().text();
//             // const subtitle = $(element).children().find($('.content-card-subtitle-food')).text();  //this find() is slowing things down. Is there a better way?
//             const image = $(element).children().children().attr("data-src");
//             const site = "https://www.atlasobscura.com"
//             const attribution = $(element).attr("href");
//             const url = site + attribution;

//             // if (title && image && url) {
//                 // try {

//                     // db.foodList.insert({
//                     //     title: title,
//                     //     // subtitle: subtitle,
//                     //     image: image,
//                     //     url, url
//                     // },
//                     // (err, inserted) => {
//                     //     if (err) {
//                     //         console.log(err);
//                     //     } else {
//                     //         console.log(inserted);
//                     //     }
//                     // });


//                 // } catch (e) {
//                 //     console.log("Catch error: " + e);
//                 // }
//             // }
//             results.push({title, image, url});
//         });
//         console.log(results);
//     });
//     // Send scrape complete message to browser
//     res.send("Food Scrape Complete");
// });

//Scrape for Mexico only
// app.get("/mexico", (req, res) => {
//                https://www.atlasobscura.com/things-to-do/australia/places
//     axios.get("https://www.atlasobscura.com/things-to-do/mexico/places").then(response => {
//         const collections = ["mexicoList"];
//         const db = mongojs(databaseUrl, collections);
//         db.on("error", error => {
//             console.log("Database Error: ", error);
//         });
//         const $ = cheerio.load(response.data);
//         const results = [];
//         $("a.content-card").each((i, element) => {
//             // console.log(element);
//             const title = $(element).children().children().children().text();
//             const subtitle = $(element).children().find($('.content-card-subtitle')).text(); 
//             const image = $(element).children().children().attr("data-src");
//             const site = "https://www.atlasobscura.com"
//             const attribution = $(element).attr("href");
//             const url = site + attribution;

//             if (title && subtitle && image && url) {
//                 // try {
//                     db.mexicoList.insert({
//                         title: title,
//                         subtitle: subtitle,
//                         image: image,
//                         url, url
//                     },
//                     (err, inserted) => {
//                         if (err) {
//                             console.log(err);
//                         } else {
//                             console.log(inserted);
//                         }
//                     });
//                 // } catch (e) {
//                 //     console.log("Catch error: " + e);
//                 // }
//             }
//             results.push({title, subtitle, image, url});
//         });
//         console.log(results);
//     });
//     // Send scrape complete message to browser
//     res.send("Mexico Scrape Complete");
// });

app.get("/destinations", (req, res) => {
    //https://www.atlasobscura.com/things-to-do/australia/places
    axios.get("https://www.atlasobscura.com/destinations").then(response => {
        const collections = ["destinations"];
        // const db = mongojs(databaseUrl, collections);
        // db.on("error", error => {
        //     console.log("Database Error: ", error);
        // });

        const $ = cheerio.load(response.data);
        const results = [];
        $("li.global-region-item").each((i, element) => {
            console.log(element);
            const region = $(element).children().find($('.item-title')).text();
            const country = $(element).children().find($('.non-decorated-link')).text(); 
            // console.log("country " + country)
            //  const image = $(element).children().children().attr("data-src");
            const site = "https://www.atlasobscura.com"
            const attribution = $(element).children().children().find($('.non-decorated-link')).attr("href");
            const url = site + attribution + "/places";

            axios.get(url).then(response => {
                const collections = ["allDestinations"];
                // const db = mongojs(databaseUrl, collections);
                // db.on("error", error => {
                //     console.log("Database Error: ", error);
                // });

                const $ = cheerio.load(response.data);
                // const results = [];
                
                $("a.content-card").each((i, element) => {
                    const result = {};
                    result.title = $(element).children().children().children().text();
                    result.subtitle = $(element).children().find($('.content-card-subtitle')).text(); 
                    result.image = $(element).children().children().attr("data-src");
                    const site = "https://www.atlasobscura.com"
                    const attribution = $(element).attr("href");
                    result.url = site + attribution;
                    console.log(db.Destination);

                    db.Destination.create(result)
                    .then(dbDestination => {
                        console.log(dbDestination);
                    })
                    .catch(err => {
                        console.log(err);
                    });
                    // results.push({title, subtitle, image, url});
                });
                // console.log(results);
            });
            // results.push({region, country, url, attribution});
        });
        // console.log(results);
    });
    // Send scrape complete message to browser
    res.send("All Destinations Scrape Complete");
});

app.listen(3300, () => {
    console.log("App is running on port 3300");
});
