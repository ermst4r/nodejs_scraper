var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var util = require("util");
var websiteName = 'couponzguru';
var media_ids = require('../media_ids/india');
var websiteUrl  ='http://www.couponzguru.com';
var date = new Date();
var MyDate = new Date();
MyDate.setMonth(MyDate.getMonth() + 6);
var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
    + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
    + MyDate.getFullYear();

var matching = require('../models/matching');
matching = matching();
var Couponzguru = function () {
    this.fetchData = function () {
        request({
            uri: "http://www.couponzguru.com/store-list"
        }, function(error, response, body) {
            var c = cheerio.load(body);
            c(".alphabet li").each(function() {
                var siteCoupon = c(this);
                var webshopName = siteCoupon.find('a').text();
                request({
                    uri: siteCoupon.find('a').attr('href')
                }, function(pageError, pageResponse, pageBody) {

                    if(!pageError && pageResponse.statusCode==200) {
                        var d = cheerio.load(pageBody);
                        d(".coupon-list").each(function() {
                            var pageDetail = d(this);
                            if(pageDetail.find('.btn.btn-info.btn-embossed.btn-block').text()=='Get This Deal') {
                                var productName = pageDetail.find('.coupon-description p').text();
                                var uid = crypto.createHash('md5').update(productName).digest('hex');
                                console.log(productName);
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
                                            media_id:  matching.mediaMatchingIn(productName,media_ids),
                                            lastUpdated: 0,
                                            country: 'in'
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
    var instance = new Couponzguru();
    return instance;
};