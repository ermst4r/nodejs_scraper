var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var websiteName = "bargainmoose_ca";
var media_ids = require('../media_ids/spain');
var websiteUrl = 'http://www.bargainmoose.ca';
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

console.log('start:' +websiteName);
var Bargainmoose_ca = function () {
    this.fetchData = function () {
        request({
            uri: "http://www.bargainmoose.ca/coupons/coupon-stores"
        }, function(error, response, body) {
            var c = cheerio.load(body);
            c(".merchants-for-letter a").each(function() {
                var stores = c(this);
                var webshopName = stores.text();
                var pageUrl = stores.attr('href');
                if (typeof pageUrl != 'undefined') {
                    request({
                        url:pageUrl
                    }, function(pageErr,pageRes,pageBody) {
                            var d = cheerio.load(pageBody);
                            d("li.voucher.voucher-normal.promotion").each(function () {
                                var detail = d(this);
                                if (detail.find('.visit-store').text() == 'View Sale') {
                                    var productName = detail.find('div.title').text();
                                    var uid = crypto.createHash('md5').update(productName).digest('hex');
                                    content.count({uid: uid}, function (error, count) {
                                        if (count == 0) {
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
                                                country: 'ca'
                                            });
                                            promise.on('success', function (err, doc) {
                                                console.log("essen : " + productName);

                                            });
                                        }
                                    });
                                }
                            });


                    });
                }

            });

        });






    };
};

module.exports = function () {
    var instance = new Bargainmoose_ca();
    return instance;
};