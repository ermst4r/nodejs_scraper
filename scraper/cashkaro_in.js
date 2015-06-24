var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var util = require("util");
var websiteName = 'cashkaro';
var media_ids = require('../media_ids/india');
var websiteUrl  ='http://www.cashkaro.com';
var date = new Date();
var scrapeStartDate = ('0' + date.getDate()).slice(-2) + '-'
    + ('0' + (date.getMonth()+1)).slice(-2) + '-'
    + date.getFullYear();
var matching = require('../models/matching');
matching = matching();


var Cashkaro = function () {




    this.fetchData = function () {



        request({
            uri: "http://cashkaro.com/stores"
        }, function(error, response, body) {
            var c = cheerio.load(body);
            c(".fl").each(function() {
                var siteCoupon = c(this);
                request({
                    uri: websiteUrl+siteCoupon.find('a').attr('href')
                }, function(pageError, pageResponse, pageBody) {
                    var webshopName = siteCoupon.find('a').text();

                    if(!pageError && pageResponse.statusCode==200) {
                        var d = cheerio.load(pageBody);
                        d(".fl.fw.store_module.pos").each(function() {
                            var pageDetail = d(this);
                            if(pageDetail.find('a.signin_popupbox.fl.button').text().replace(/ /g,'').toLowerCase().replace(/\r?\n|\r/g, " ").trim()=='grabdeal') {
                                var productName = pageDetail.find('.fw.cash').text();
                                var uid = crypto.createHash('md5').update(productName).digest('hex');
                                var MyDate = new Date();
                                var siteDate  =parseInt(pageDetail.find('.fr.expires.pos').text().replace(/\D/g,''));
                                if(!isNaN(siteDate)) {
                                    MyDate.setDate(MyDate.getDate() + siteDate);
                                } else {
                                    MyDate.setMonth(MyDate.getMonth() + 6);
                                }
                                var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
                                    + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
                                    + MyDate.getFullYear();

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
                                            media_id:  matching.mediaMatchingIn(productName,media_ids),
                                            deleted: 0,
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
    var instance = new Cashkaro();
    return instance;
};