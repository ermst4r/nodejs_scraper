var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var util = require("util");
var websiteName = 'sparwelt';
var media_ids = require('../media_ids/germany');
var websiteUrl  ='http://www.sparwelt.de';
var date = new Date();
var scrapeStartDate = ('0' + date.getDate()).slice(-2) + '-'
    + ('0' + (date.getMonth()+1)).slice(-2) + '-'
    + date.getFullYear();
var MyDate = new Date();
MyDate.setMonth(MyDate.getMonth() + 6);
var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
    + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
    + MyDate.getFullYear();
var matching = require('../models/matching');
matching = matching();


var Sparwelt = function () {




    this.fetchData = function () {


        var MyDate = new Date();
        MyDate.setMonth(MyDate.getMonth() + 6);
        var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
            + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
            + MyDate.getFullYear();

        request({
            uri: "http://www.sparwelt.de/gutscheine/anbieter-a-z"
        }, function(error, response, body) {
            var c = cheerio.load(body);
            c(".icon-link").each(function() {
                var siteCoupon = c(this);
                var webshopName =  siteCoupon.attr('title').replace(' Gutscheine','');
                request({
                    uri: siteCoupon.attr('href')
                }, function(pageError, pageResponse, pageBody) {
                    if(!pageError && pageResponse.statusCode==200) {
                        var d = cheerio.load(pageBody);
                        d(".teaser.teaser-voucher.status-1 ").each(function() {
                            var detail = d(this);
                            var offerChk = detail.find('.col-xs-12.col-sm-6 span.text').text().replace(/ /g,'').toLowerCase().replace(/\r?\n|\r/g, " ").trim();
                            if(offerChk=='zumsale' || offerChk=='zumangebot') {
                                var productName = detail.find('span.h3.title').text().trim();
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
                                            media_id:  matching.mediaMatchingDe(productName,media_ids),
                                            lastUpdated: 0,
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
    var instance = new Sparwelt();
    return instance;
};