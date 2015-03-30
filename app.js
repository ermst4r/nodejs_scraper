// call the packages we need
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var morgan = require('morgan');
var scraper = require('./scraper');
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



// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

router.use(function(req, res, next) {
    console.log('Something is happening.');
    next();
});

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
            content.update({newProductName: oldValue}, {$set : {"offerExpireDate": newValue}}, function(err,doc){
                console.log(err);
            });
        } else {
            content.update({newProductName: oldValue}, {$set : {"updated":1,"productName": newValue,newProductName:crypto.createHash('md5').update(newValue).digest('hex')}}, function(err,doc){
                console.log(err);
                console.log("gelukt");
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



// e.g. http://localhost:3000/api/getcontent/cupones
router.route('/getcontent/:website_name/:updated/:deleted')
    .get(function(req, res) {
        var newDocs = new Array;
        console.log(req.params.deleted);
        if(req.params.updated == -1) {
            var jsonQuery = {"website":req.params.website_name,"deleted":parseInt(req.params.deleted)};
        } else if(req.params.updated == 1) {
            var jsonQuery = {"website":req.params.website_name,"updated":1,"deleted":parseInt(req.params.deleted)};
        } else if(req.params.updated == 0) {
            var jsonQuery = {"website":req.params.website_name,"updated":0,"deleted":parseInt(req.params.deleted)};
        }


        content.find(jsonQuery, { sort:{shopName:1},fields : {productUrl:0,_id:0,orginProductName:0}} , function (error, docs) {
            var jsonFile = parsedJSON;
            for(var i=0; i<jsonFile.length; i++) {
                for(var x=0; x<docs.length;x++) {
                    var obj = docs[x];
                       if(obj.shopName.toLowerCase() == jsonFile[i].toLowerCase()) {
                           newDocs.push({website:req.params.website_name,shopName:obj.shopName,productName:obj.productName,endDate:obj.offerExpireDate});
                       }
                }
            }
            res.json(newDocs);
        });

    });



router.route('/check_content/:website_name')
    .post(function(req, res) {
        if(req.body.content_hash != null) {

            var md5hash = crypto.createHash('md5').update(req.body.content_hash).digest('hex');
            content.count({website:req.params.website_name,orginProductName:md5hash}, function (error, count) {
                if(count == 1) {
                    res.send("1");
                } else {
                    res.send("0");
                }
            });
        }
});

router.route('/run_spider/:website_name')
    .get(function(req, res) {
        scraper.setScraper(req.params.website_name);
        var done = scraper.parseWebsite();
        res.send(done);
    });


router.route('/getdata/:website_name/:type/:updated/:deleted')
// get the bear with that id
    .get(function(req, res) {
        if(req.params.updated == -1) {
            var jsonQuery = {"website":req.params.website_name,"deleted":parseInt(req.params.deleted)};
        } else if(req.params.updated == 1) {
            var jsonQuery = {"website":req.params.website_name,"updated":1,"deleted":parseInt(req.params.deleted)};
        } else if(req.params.updated == 0) {
            var jsonQuery = {"website":req.params.website_name,"updated":0,"deleted":parseInt(req.params.deleted)};
        }
        content.find(jsonQuery, { sort:{shopName:1},fields : {productUrl:0,_id:0,orginProductName:0,uid:0,newProductName:0}} , function (error, docs) {
            var jsonFile = new Array;
            var shopMatch = parsedJSON;
            for(var i=0; i<shopMatch.length; i++) {
                for (var y = 0; y < docs.length; y++) {
                    var obj = docs[y];
                    if(obj.shopName.toLowerCase() == shopMatch[i].toLowerCase()) {
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
                }
            }
            switch(req.params.type) {
                case "csv":
                    exportFile.exportCsv(req.params.website_name,jsonFile,res);
                break;
                case "json":
                    res.json(jsonFile);
                break;
                case "xls":
                    exportFile.exportXls(req.params.website_name,jsonFile,res);
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
