var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var util = require("util");
var websiteName = 'gutscheincodes';
var media_ids = require('../media_ids/germany');
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

var Gutscheincodes = function () {




    this.fetchData = function () {




        request({
            uri: "http://gutscheincodes.de/shops/"
        }, function(error, response, body) {
            var c = cheerio.load(body);

            c(".box.vendor-column-list ul li a").each(function() {
                var coupon = c(this);
                var pageUrl =  coupon.attr('href');
                var webshopName = coupon.text();
                if(typeof pageUrl !== 'undefined') {
                    request({
                        uri: pageUrl
                    }, function(pageError, pageResponse, pageBody) {
                        if(!pageError && pageResponse.statusCode==200) {

                            var d = cheerio.load(pageBody);
                            d("ul.detail-list-vendor li").each(function() {

                                var detail = d(this);
                                console.log(detail.find('footer').text());
                                if(detail.find('footer').text() =='Rabatt-Aktion') {
                                    var productName = detail.find('.info.has-promotion p').text();
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
                }






            });

        });

    };
};

module.exports = function () {
    var instance = new Gutscheincodes();
    return instance;
};