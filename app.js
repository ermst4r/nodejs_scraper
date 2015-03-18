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
// New Code
//var scraper = scraper();
//scraper.setScraper("cupones");
//scraper.parseWebsite();


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
        res.send(newValue);
        content.update({orginProductName: oldValue,shopName:shopName}, {$set : {"productName": newValue}}, function(err,doc){
            console.log(err);
        });
});

// e.g. http://localhost:3000/api/getcontent/cupones
router.route('/getcontent/:website_name')
    .get(function(req, res) {
        var data;

        content.find({website:req.params.website_name}, { sort:{shopName:1},fields : {productUrl:0,_id:0,orginProductName:0}} , function (error, docs) {
            res.json(docs);
        });

    });



router.route('/check_content/:website_name/:content_hash')
// get the bear with that id
    .get(function(req, res) {
        if(req.params.content_hash != null) {
            var md5hash = crypto.createHash('md5').update(req.params.content_hash).digest('hex');
            console.log('orgineel: '+ req.params.content_hash + 'hash:' +md5hash+"\n");
            content.count({website:req.params.website_name,orginProductName:md5hash }, function (error, count) {
                if(count == 1) {
                    res.send("1");
                } else {
                    res.send("0");
                }
            });
        }



    });





app.use(enableCORS);
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);


module.exports = app;
