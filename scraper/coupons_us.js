var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var websiteName = "coupons_us";
var media_ids = require('../media_ids/spain');
var websiteUrl = 'http://www.coupons.com';
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
var Coupons_us = function () {
    this.fetchData = function () {
        request({
            uri: "http://www.coupons.com/coupon-codes/stores/"
        }, function(error, response, body) {
            var c = cheerio.load(body);
            c(".storelisting a").each(function() {
                var category = c(this);
                var pageUrl = websiteUrl+category.attr('href');
                var webshopName = category.text();
                console.log(pageUrl);
                request({
                    uri: pageUrl
                }, function(pageError, pageResponse, pageBody) {
                    if(!pageError && pageResponse.statusCode==200) {
                        var d = cheerio.load(pageBody);
                        d(".sales").each(function() {
                            var detail = d(this);
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
                                            country: 'us'
                                        });
                                        promise.on('success', function (err, doc) {
                                            console.log("essen : " + websiteName);

                                        });
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
    var instance = new Coupons_us();
    return instance;
};