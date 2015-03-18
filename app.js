// call the packages we need
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var morgan = require('morgan');
var scraper = require('./scraper');
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
var json2csv = require('json2csv');
// New Code
var scraper = scraper();
scraper.setScraper("cupones");
scraper.parseWebsite();


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
        var shopName = req.body.shopName;
        res.send(newValue + oldValue);
        content.update({newProductName: oldValue}, {$set : {"updated":1,"productName": newValue,newProductName:crypto.createHash('md5').update(newValue).digest('hex')}}, function(err,doc){
            console.log(err);
        });
});

// e.g. http://localhost:3000/api/getcontent/cupones
router.route('/getcontent/:website_name')
    .get(function(req, res) {
        var newDocs = new Array ;
        content.find({website:req.params.website_name}, { sort:{shopName:1},fields : {productUrl:0,_id:0,orginProductName:0}} , function (error, docs) {
            var jsonFile = parsedJSON;
            for(var i=0; i<jsonFile.length; i++) {
                for(var x=0; x<docs.length;x++) {
                    var obj = docs[x];
                       if(obj.shopName.toLowerCase() == jsonFile[i].toLowerCase()) {
                           newDocs.push({website:"cupones",shopName:obj.shopName,productName:obj.productName});
                       }
                }
            }
            console.log(newDocs);
            res.json(newDocs);
        });

    });



router.route('/check_content/:website_name')
// get the bear with that id
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


router.route('/getdata/:website_name/:type')
// get the bear with that id
    .get(function(req, res) {
        content.find({website:req.params.website_name}, { sort:{shopName:1},fields : {productUrl:0,_id:0,orginProductName:0,uid:0,newProductName:0}} , function (error, docs) {
            switch(req.params.type) {
                case "csv":
                    var jsonFile = new Array;
                    for(var y=0; y<docs.length; y++) {
                        var obj = docs[y];
                        jsonFile.push({website:req.params.website_name,shopName:obj.shopName,productName:obj.productName})
                    }
                    json2csv({data: jsonFile, fields: ['website', 'shopName','productName']}, function(err, csv) {
                        res.setHeader('Content-disposition', 'attachment; filename='+req.params.website_name+'.csv');
                        res.send(csv);
                    });
                break;
                case "json":
                    res.json(docs);
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
