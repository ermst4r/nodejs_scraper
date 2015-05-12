var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var media_ids = require('../media_ids/germany');
var util = require("util");
var websiteName = 'gutscheinpony';
var date = new Date();
var scrapeStartDate = ('0' + date.getDate()).slice(-2) + '-'
    + ('0' + (date.getMonth()+1)).slice(-2) + '-'
    + date.getFullYear();
var MyDate = new Date();
MyDate.setMonth(MyDate.getMonth() + 6);
var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
    + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
    + MyDate.getFullYear();
var parsedJSON = require('../shopnames/de');
var matching = require('../models/matching');
matching = matching();

var Gutscheinpony = function () {




    this.fetchData = function () {

        request({
            uri: "https://www.gutscheinpony.de/gutscheine"
        }, function(error, response, body) {
            var c = cheerio.load(body);
            c(".col-md-3.col-xs-4.shop-list-width").each(function() {
                var siteCoupon = c(this);
                var webshopName = siteCoupon.find('a').attr('title');
                request({
                    uri: 'https://www.gutscheinpony.de/'+siteCoupon.find('a').attr('href')
                }, function(pageError, pageResponse, pageBody) {
                    if(!pageError && pageResponse.statusCode==200) {
                        var d = cheerio.load(pageBody);
                        d(".col-md-9.col-sm-9.col-xs-8.offer-right").each(function() {
                            var detail = d(this);
                            if(detail.find('a.btn.btn-info.engine-checkout').text().replace(/ /g,'').toLowerCase().replace(/\r?\n|\r/g, " ").trim() =='aktionanzeigen') {
                                var productName = detail.find('h3').text();
                                var uid = crypto.createHash('md5').update(productName).digest('hex');
                                content.count({uid:uid}, function (error, count) {
                                    if(count == 0 ) {
                                        var promise = content.insert({
                                            uid: uid,
                                            website: websiteName,
                                            shopName: webshopName.trim().toLowerCase().replace(/ /g, ''),
                                            productName: productName,
                                            orginProductName: crypto.createHash('md5').update(productName).digest('hex'),
                                            newProductName: crypto.createHash('md5').update(productName).digest('hex'),
                                            orginProductNameUnhashed: productName,
                                            updated: 0,
                                            scrapeStartDate: scrapeStartDate,
                                            offerExpireDate: finalActionExpireDate,
                                            deleted: 0,
                                            lastUpdated: 0,
                                            media_id:  matching.mediaMatchingDe(productName,media_ids),
                                            country: 'de'
                                        });
                                        promise.on('success', function (err, doc) {
                                            console.log("essen : " + websiteName);

                                        });
                                    }
                                });
                            }


                        });
                    }


                });
            });

        });





    };
};

module.exports = function () {
    var instance = new Gutscheinpony();
    return instance;
};