var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var websiteName = "gutschein_ch";
var media_ids = require('../media_ids/india');
var websiteUrl = 'http://www.gutschein.ch/';
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
//the endDate

MyDate.setMonth(MyDate.getMonth() + 6);
var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
    + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
    + MyDate.getFullYear();


var Gutschein_ch = function () {
    this.fetchData = function () {
        request({
            uri: "http://www.gutschein.ch/alle-anbieter/"
        }, function(error, response, body) {
            var d = cheerio.load(body);
            d('.anbieterlist ul li').each(function() {
                var detail = d(this);
                var shopName = detail.find('a').text().trim();
                var pageUrl = websiteUrl+detail.find('a').attr('href');
                request({
                    uri: pageUrl
                }, function(pageError, pageResponse, pageBody) {
                    if(!pageError && pageResponse.statusCode==200) {
                        var p = cheerio.load(pageBody);
                        p('.couponbox').each(function() {
                            var pDetail = p(this);
                            if(pDetail.find('.action-button.action-button-active').text().trim() == 'Aktion anzeigen') {
                                var productName = pDetail.find('h3').text();
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
                            }

                        });
                    }
                });
            });

        });

    };
};

module.exports = function () {
    var instance = new Gutschein_ch();
    return instance;
};