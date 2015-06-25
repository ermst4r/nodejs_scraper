var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var websiteName = "valpak_us";
var media_ids = require('../media_ids/spain');
var websiteUrl = 'https://www.valpak.com';
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


var Valpak_us = function () {
    this.fetchData = function () {
        request({
            uri: "https://www.valpak.com/coupons/coupon-codes/featured"
        }, function(error, response, body) {
            var c = cheerio.load(body);
            c(".list a").each(function() {
                var category = c(this);
                var pageUrl = websiteUrl+ category.attr('href');
                request({
                    uri: pageUrl
                }, function(webError, webResponse, webBody) {
                    var w = cheerio.load(webBody);
                    w("ul.featured-merchants__tiles li").each(function() {
                        var webshop = w(this);
                        var webshopName = webshop.find('h3').text();
                        var pageUrl = websiteUrl+webshop.find('a').attr('href');
                        request({
                            uri: pageUrl
                        }, function(pageDetail, pageResponse, pageBody) {
                            var p = cheerio.load(pageBody);
                            p(".listing.listing--affiliate").each(function() {
                                var page = p(this);
                                if(page.find('button.listing__primary-action').text()=='Activate') {
                                    var productName = page.find('h2.listing__title.fake-link').text();
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
                                }

                            });

                        });

                    });

                });

            });

        });

    };
};

module.exports = function () {
    var instance = new Valpak_us();
    return instance;
};