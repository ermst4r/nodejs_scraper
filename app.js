// call the packages we need
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var morgan = require('morgan');
var scraper = require('./scraper');
var levenshtein = require('levenshtein');
var exportFile = require('./models/export');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var port = process.env.PORT || 3000;        // set our port
var mongo = require('mongodb');
var monk = require('monk');
mongoConnectionString = "localhost:27017/scrapedcontent";
mongoCollection ="content";
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var crypto = require('crypto');
var parsedJSON = require('./shopnames');
var d = new Date();
var today = ('0' + d.getDate()).slice(-2) + '-'
    + ('0' + (d.getMonth()+1)).slice(-2) + '-'
    + d.getFullYear();
var exportAuteur = 'Arthur Goldman';
var scraper = scraper();
var exportFile = exportFile();
var util = require("util");


//
scraper.setScraper('flipit_es');
var done = scraper.parseWebsite();

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

router.use(function(req, res, next) {
    console.log('Something is happening.');
    next();
});

//scraper.setScraper("cuponesmagicos");
//var done = scraper.parseWebsite();

var enableCORS = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
};



//http://localhost:3000/api/updatecode
router.route('/updatecode')
    .post(function(req, res) {

        var oldValue = crypto.createHash('md5').update(req.body.oldValue).digest('hex');
        var newValue = req.body.newValue;
        var dateChange = req.body.dateChange;
        if(dateChange == 1) {
            content.update({newProductName: oldValue}, {$set : {"offerExpireDate": newValue,lastUpdated:today}}, function(err,doc){
                console.log(err);
            });
        } else {
            content.update({newProductName: oldValue}, {$set : {"updated":1,lastUpdated:today,"productName": newValue,newProductName:crypto.createHash('md5').update(newValue).digest('hex')}}, function(err,doc){
                console.log(err);
                console.log("gelukt" + today);
            });
        }
        res.send("done");

});

//http://localhost:3000/api/delete_code
// just set param to 1
router.route('/delete_code')
    .post(function(req, res) {
        var oldValue = crypto.createHash('md5').update(req.body.oldValue).digest('hex');
        if(req.body.delete == 1) {
            content.update({newProductName: oldValue}, {$set : {"deleted":0}}, function(err,doc){
                console.log(err);
            });
        } else {
            content.update({newProductName: oldValue}, {$set : {"deleted":1}}, function(err,doc){
                console.log(err);
            });
        }


        res.send("done");

    });





router.route('/noflipitdata/')
    .get(function(req, res) {
        var jsonQuery = { "website": { $ne: "flipit_es" } };
        var newDocs = new Array();
        content.find(jsonQuery , function (error, docs) {
            for(var x=0; x<docs.length;x++) {
                var obj = docs[x];
                newDocs.push(obj.shopName);
            }
            res.json(newDocs);
        });

    });


router.route('/getflipitdata/')
    .get(function(req, res) {
        var jsonQuery = {"website":"flipit_es"};
        var newDocs = new Array();
        content.find(jsonQuery , function (error, docs) {
            for(var x=0; x<docs.length;x++) {
                var obj = docs[x];
                newDocs.push(obj.shopName);
            }
            res.json(newDocs);
        });

    });



// e.g. http://localhost:3000/api/getcontent/cupones
router.route('/getcontent/:website_name/:updated/:deleted')
    .get(function(req, res) {
        var newDocs = new Array;
        if(req.params.updated == -1) {
            var jsonQuery = {"deleted":parseInt(req.params.deleted)};
        } else if(req.params.updated == 1) {
            var jsonQuery = {"updated":1,"deleted":parseInt(req.params.deleted)};
        } else if(req.params.updated == 0) {
            var jsonQuery = {"updated":0,"deleted":parseInt(req.params.deleted) };
        }

        content.find(jsonQuery, {sort:{shopName:1,website:-1},fields : {productUrl:0,_id:0,orginProductName:0}} , function (error, docs) {
                for(var x=0; x<docs.length;x++) {
                    var obj = docs[x];
                    newDocs.push({website:obj.website,shopName:obj.shopName,productName:obj.productName,endDate:obj.offerExpireDate});
                }
            res.json(newDocs);
        });

    });




router.route('/run_spider/:website_name')
    .get(function(req, res) {
        scraper.setScraper(req.params.website_name);
        var done = scraper.parseWebsite();
        res.send(done);
    });


router.route('/gethashcontent/:website_name/:updated/:deleted')
    .get(function(req, res) {
        if(req.params.updated == -1) {
            var jsonQuery = {"deleted":parseInt(req.params.deleted)};
        } else if(req.params.updated == 1) {
            var jsonQuery = {"updated":1,"deleted":parseInt(req.params.deleted)};
        } else if(req.params.updated == 0) {
            var jsonQuery = {"updated":0,"deleted":parseInt(req.params.deleted)};
        }
        var newDocs = new Array();

        content.find(jsonQuery, { sort:{shopName:1},fields : {productUrl:0,_id:0,website:0,endDate:0}} , function (error, docs) {
            for(var x=0; x<docs.length;x++) {
                var obj = docs[x];
                    newDocs.push(obj.orginProductNameUnhashed);
            }

            res.json(newDocs);
        });

    });


router.route('/getdata/:type/:updated/:deleted')
// get the bear with that id
    .get(function(req, res) {
        if(req.params.updated == -1) {
            var jsonQuery = {"deleted":parseInt(req.params.deleted)};
        } else if(req.params.updated == 1) {
            var jsonQuery = {"updated":1,"deleted":parseInt(req.params.deleted)};
        } else if(req.params.updated == 0) {
            var jsonQuery = {"updated":0,"deleted":parseInt(req.params.deleted)};
        }
        content.find(jsonQuery, { sort:{shopName:1},fields : {productUrl:0,_id:0,orginProductName:0,uid:0,newProductName:0}} , function (error, docs) {
            var jsonFile = new Array;
                for (var y = 0; y < docs.length; y++) {
                    var obj = docs[y];

                        jsonFile.push({
                            productName: obj.productName,
                            shopName: obj.shopName,
                            type: 'Aanbieding',
                            zichtbaarheid: 'Standaard',
                            uitgeklapt: 'Nee',
                            startDate: today,
                            endDate: obj.offerExpireDate,
                            clickouts: 0,
                            auteur: exportAuteur,
                            couponCode: '',
                            extra_field: '',
                            exclusief: 'Nee',
                            editor_picks: 'Nee',
                            user_generated: 'Nee',
                            goedgekeurd: 'Nee',
                            offline: 'Nee',
                            created_at: today,
                            deeplink: '',
                            extra_field2: '',
                            media_id:obj.media_id
                        })

                }

            switch(req.params.type) {
                case "csv":
                    exportFile.exportCsv(today,jsonFile,res);
                break;
                case "json":
                    res.json(jsonFile);
                break;
                case "xls":
                    exportFile.exportXls(today,jsonFile,res);
                break;

            }



        });

    });
app.use(enableCORS);
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);


module.exports = app;
