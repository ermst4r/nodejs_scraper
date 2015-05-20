var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var util = require("util");
var websiteName = 'couponraja';
var media_ids = require('../media_ids/india');
var websiteUrl  ='http://www.couponraja.in/';
var date = new Date();
var MyDate = new Date();
var scrapeStartDate = ('0' + date.getDate()).slice(-2) + '-'
    + ('0' + (date.getMonth()+1)).slice(-2) + '-'
    + date.getFullYear();
var matching = require('../models/matching');
matching = matching();
var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
    + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
    + MyDate.getFullYear();


var Couponraja = function () {

    this.fetchData = function () {

        var headers = {
            'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36'
        }
        request({
            uri: "http://www.couponraja.in/controls/allstoresproxy.aspx?character=all"
        }, function(error, response, body) {

            var c = cheerio.load(body);
            c("ul li").each(function () {
                var siteCoupon = c(this);
                var webshopName = siteCoupon.find('a').text().trim();
                request({
                    uri: siteCoupon.find('a').attr('href'),
                    headers: headers
                }, function(pageError, pageResponse, pageBody) {

                    if(!pageError && pageResponse.statusCode==200) {
                        var d = cheerio.load(pageBody);
                        d("#pnlwithcoupon").each(function() {
                            var pageDetail = d(this);
                            if(pageDetail.find('.coupon-sec.cpn-code').text() =='Get Deal') {
                                var productName = pageDetail.find('.coupon-sec.ofr-descp').text();
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
    var instance = new Couponraja();
    return instance;
};