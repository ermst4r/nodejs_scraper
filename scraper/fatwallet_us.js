var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var websiteName = "fatwallet_us";
var media_ids = require('../media_ids/spain');
var websiteUrl = 'http://www.fatwallet.com';
var util = require("util");
var parsedJSON = require('../shopnames');
var jsonFile = parsedJSON;
var matching = require('../models/matching');
matching = matching();
var date = new Date();
var scrapeStartDate = ('0' + date.getDate()).slice(-2) + '-'
    + ('0' + (date.getMonth()+1)).slice(-2) + '-'
    + date.getFullYear();
var MyDate = new Date();
MyDate.setMonth(MyDate.getMonth() + 6);
var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
    + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
    + MyDate.getFullYear();
var Fatwallet_us = function () {
    console.log("start:" + websiteName);


    this.fetchData = function () {
        request({
            uri: "http://www.fatwallet.com/cash-back-shopping/"
        }, function(error, response, body) {
            var c = cheerio.load(body);
            c(".storeName a").each(function() {
                var category = c(this);
                var pageUrl = websiteUrl+category.attr('href');
                var webshopName = category.find('.storeListStoreName').text();
                request({
                    uri: pageUrl
                }, function(pageError, pageResponse, pageBody) {
                    if(!pageError && pageResponse.statusCode==200) {
                        var d = cheerio.load(pageBody);
                        d("ul.offer-list-container li .offer-cell").each(function() {
                            var detail = d(this);
                            var productName = detail.find('a.offer-details-url.internal').text().trim();
                            var uid = crypto.createHash('md5').update(productName).digest('hex');
                            if(detail.find('.offer-code-text').text()=='') {
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
                                            country: 'us'
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
    var instance = new Fatwallet_us();
    return instance;
};