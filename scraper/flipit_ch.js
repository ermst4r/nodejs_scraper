var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var trim = require('trim');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var websiteName = "zflipit_ch";
var websiteUrl = 'http://www.flipit.com/ch/';
var util = require("util");
var parsedJSON = require('../shopnames/ch_match.json');
var jsonFile = parsedJSON;
var matching = require('./../models/matching');
var matching = matching();



var Flipit_ch = function () {
    console.log('start: ' + websiteName);
    this.fetchData = function () {
        var date = new Date();
        var scrapeStartDate = ('0' + date.getDate()).slice(-2) + '-'
            + ('0' + (date.getMonth()+1)).slice(-2) + '-'
            + date.getFullYear();
        var uriPath = new Array();
        uriPath[0] = 'alle-shops-09-e';
        uriPath[1] = 'alle-shops-f-j';
        uriPath[2] = 'alle-shops-k-o';
        uriPath[3] = 'alle-shops-p-t';
        uriPath[4] = 'alle-shops-u-z';
        content.remove({ "website": websiteName }, function (err) {
            if (err) throw err;
        });
        for (var z = 0; z<uriPath.length;  z++) {
            request({
                uri: websiteUrl + uriPath[z]
            }, function (error, response, body) {
                console.log(response.statusCode);
                if (!error && response.statusCode == 200) {

                    var p = cheerio.load(body);
                    p('.content-holder ul li a').each(function () {
                        var pDetail = p(this);
                        request({
                            uri: pDetail.attr('href')
                        }, function (pageError, pageResponse, pageBody) {
                            if (!pageError && pageResponse.statusCode == 200) {
                                var d = cheerio.load(pageBody);
                                var shopName = d('.radiusImg').attr('alt');
                                d('.holder.offer-holder').each(function () {
                                    var detail = d(this);
                                    var productName = detail.find('h3 a').text().replace(/^\s+|\s+$/g, '');
                                    var isOffer = detail.find('.btn-code').text();
                                    var uid = crypto.createHash('md5').update(productName).digest('hex');
                                    if (isOffer.trim().toLowerCase().replace(/ /g, '') == 'hierklicken') {
                                        content.count({uid: uid}, function (error, count) {
                                            if (count == 0) {
                                                if (jsonFile.indexOf(shopName.trim().toLowerCase().replace(/ /g, '')) > 0) {
                                                    var promise = content.insert({
                                                        uid: uid,
                                                        website: websiteName,
                                                        shopName: shopName.trim().toLowerCase().replace(/ /g, ''),
                                                        productName: productName,
                                                        orginProductName: crypto.createHash('md5').update(productName + websiteName).digest('hex'),
                                                        newProductName: crypto.createHash('md5').update(productName + websiteName).digest('hex'),
                                                        orginProductNameUnhashed: productName + websiteName,
                                                        updated: 0,
                                                        scrapeStartDate: scrapeStartDate,
                                                        deleted: 0,
                                                        lastUpdated: 0,
                                                        country: "ch",
                                                        flipit:1
                                                    });
                                                    promise.on('success', function (err, doc) {
                                                        console.log("essen : " + shopName.trim().toLowerCase().replace(/ /g, ''));
                                                    });
                                                    promise.on('error', function (err, doc) {
                                                        console.log("error");

                                                    });
                                                }
                                            }
                                        });
                                    }


                                });
                            }
                        });


                    });
                }

            });
        }




    };
};

module.exports = function () {
    var instance = new Flipit_ch();
    return instance;
};