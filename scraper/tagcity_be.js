var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var util = require("util");
var websiteName = 'tagcity';
var media_ids = require('../media_ids/germany');
var websiteUrl  ='http://www.tagcity.be';
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


var Tagcity_be = function () {




    this.fetchData = function () {


        var MyDate = new Date();
        MyDate.setMonth(MyDate.getMonth() + 6);
        var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
            + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
            + MyDate.getFullYear();
        request({
            uri: "http://tagcity.be/webshops/"
        }, function(error, response, body) {
            var c = cheerio.load(body);
            c(".categorycontainer a").each(function() {
                var siteCoupon = c(this);
                var webshopName =  siteCoupon.find('.shop').text();
                request({
                    uri: 'http://tagcity.be/shop/aliexpress/'
                }, function(pageError, pageResponse, pageBody) {
                    if (!pageError && pageResponse.statusCode == 200) {
                        var d = cheerio.load(pageBody);
                        d(".coupon ").each(function() {
                            var detail = d(this);
                            var productName = detail.find('h4').text().trim();
                            var uid = crypto.createHash('md5').update(productName).digest('hex');
                            if(siteCoupon.attr('href')==detail.find('a').attr('href')) {
                                if(detail.find('.showcode').text()=='Toon Coupon' && detail.find('.showcode').text()!='') {
                                    request({
                                        uri: detail.find('a').attr('href')+'?open='+detail.attr('data-id')
                                    }, function(codeError, codeResponse, codeBody) {
                                        if(!codeError) {
                                            var code = cheerio.load(codeBody);
                                            content.count({uid:uid}, function (error, count) {
                                                if(count == 0 ) {
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
                                                        media_id:  0,
                                                        lastUpdated: 0,
                                                        country: 'be',
                                                        hasCode:1,
                                                        code:code('.couponCode').text()
                                                    });
                                                    promise.on('success', function (err, doc) {
                                                        console.log("essen code : " + code);

                                                    });


                                                }
                                            });


                                        }
                                    });

                                } else {
                                    content.count({uid:uid}, function (error, count) {
                                        if(count == 0 ) {
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
                                                media_id:  0,
                                                lastUpdated: 0,
                                                country: 'be',
                                                hasCode:0
                                            });
                                            promise.on('success', function (err, doc) {
                                                console.log("essen offer : " + websiteName);

                                            });
                                        }
                                    });
                                }


                            }






                        });

                    }
                });





            });

        });





    };
};

module.exports = function () {
    var instance = new Tagcity_be();
    return instance;
};