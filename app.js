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


//http://localhost:3000/api/updatecode
router.route('/updatecode')
    .post(function(req, res) {
        res.send(req.body.codeHash);
});

// e.g. http://localhost:3000/api/getcontent/cupones
router.route('/getcontent/:website_name')
    .get(function(req, res) {
        content.find({website:req.params.website_name}, function (error, docs) {
            res.json(docs);
        });

    });




router.route('/check_content/:website_name/:content_hash')
// get the bear with that id
    .get(function(req, res) {
        res.send(req.params.website_name + req.params.content_hash);

    });






app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);


module.exports = app;
