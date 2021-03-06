var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var util = require("util");
var websiteName = 'promo-code';
var media_ids = require('../media_ids/germany');
var websiteUrl  ='http://www.promo-code.be';
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


var Promocode_be = function () {




    this.fetchData = function () {


        var MyDate = new Date();
        MyDate.setMonth(MyDate.getMonth() + 6);
        var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
            + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
            + MyDate.getFullYear();
        request({
            uri: "http://promo-code.be/store-list/"
        }, function(error, response, body) {
            var c = cheerio.load(body);
            c("#CouponPressStores a").each(function() {
                var siteCoupon = c(this);
                request({
                    uri: siteCoupon.attr('href')
                }, function(pageError, pageResponse, pageBody) {
                    if (!pageError && pageResponse.statusCode == 200) {
                        var d = cheerio.load(pageBody);
                        console.log(siteCoupon.attr('href'));
                        d(".couponlist li ").each(function() {
                            var detail = d(this);
                            var productName = detail.find('p.excerpt').text().trim();
                            var shopName = detail.find('img').attr('alt').replace(/promotiecode|kortingscode|Couponcode|coupon code|promotion code|code|actiecode|promotional/,'').trim();
                            var uid = crypto.createHash('md5').update(productName).digest('hex');
                            if(detail.find('.promo a').text().trim().toLowerCase().replace(/ /g, '') =='klik&verkrijgkorting»') {
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


                            } else {
                                var id = parseInt(String(detail.find('.clicktoreveal-link.clearfix').attr('id')).replace('hide-',''));
                                var code = detail.find("#clickreveal-"+id).text().replace(' Code: ','');
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
                                            code:code
                                        });
                                        promise.on('success', function (err, doc) {
                                            console.log("essen code : " + code);

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
    var instance = new Promocode_be();
    return instance;
};