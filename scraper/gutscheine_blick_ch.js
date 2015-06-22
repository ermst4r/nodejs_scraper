var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var websiteName = "gutschein_blick_ch";
var media_ids = require('../media_ids/india');
var websiteUrl = 'http://gutscheine.blick.ch';
var util = require("util");
var parsedJSON = require('../shopnames');
var jsonFile = parsedJSON;
var matching = require('../models/matching');
matching = matching();
var MyDate = new Date();
var date = new Date();
var scrapeStartDate = ('0' + date.getDate()).slice(-2) + '-'
    + ('0' + (date.getMonth()+1)).slice(-2) + '-'
    + date.getFullYear();
MyDate.setMonth(MyDate.getMonth() + 6);
var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
    + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
    + MyDate.getFullYear();

var Gutschein_blick_ch = function () {
    this.fetchData = function () {
        request({
            uri: "http://gutscheine.blick.ch/alle-shops/"
        }, function(error, response, body) {
            var d = cheerio.load(body);
            d('.large-12.columns.alphabet-list ul li a').each(function() {
                var detail = d(this);
                var shopName = detail.text();
                var pageUrl = websiteUrl+detail.attr('href');
                console.log(pageUrl);
                request({
                    uri: pageUrl
                }, function(pageError, pageResponse, pageBody) {
                    if(!pageError && pageResponse.statusCode==200) {
                        var p = cheerio.load(pageBody);
                        p('.large-12.columns.retailer article.deal').each(function() {
                            var pDetail = p(this);
                            var productName = pDetail.find('.title').text();
                            console.log(productName);
                            var uid = crypto.createHash('md5').update(productName).digest('hex');
                            content.count({uid:uid}, function (error, count) {
                                if(count == 0 ) {
                                    if (jsonFile.indexOf(shopName.trim().toLowerCase().replace(/ /g, '')) > 0) {
                                        var promise = content.insert({
                                            uid: uid,
                                            website: websiteName,
                                            shopName: shopName.trim().toLowerCase().replace(/ /g, ''),
                                            productName: productName,
                                            orginProductName: crypto.createHash('md5').update(productName).digest('hex'),
                                            newProductName: crypto.createHash('md5').update(productName).digest('hex'),
                                            orginProductNameUnhashed: productName,
                                            updated: 0,
                                            scrapeStartDate: scrapeStartDate,
                                            offerExpireDate: finalActionExpireDate,
                                            deleted: 0,
                                            country:"ch",
                                            lastUpdated: 0
                                        });
                                        promise.on('success', function (err, doc) {
                                            console.log("essen : " + websiteName);

                                        });
                                    }
                                }

                            });
                        });
                    }

                });
            });

        });





    };
};

module.exports = function () {
    var instance = new Gutschein_blick_ch();
    return instance;
};