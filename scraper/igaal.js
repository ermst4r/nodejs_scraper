var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var util = require("util");
var websiteName = 'igaal';
var media_ids = require('../media_ids/germany');
var websiteUrl  ='http://fr.igraal.com/';
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


var Igaal_fr = function () {




    this.fetchData = function () {


        var MyDate = new Date();
        MyDate.setMonth(MyDate.getMonth() + 6);
        var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
            + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
            + MyDate.getFullYear();
        var alphabet = "abcdefghijklmnopqrstuvwxyz0".split("");
        for(var i=0; i<alphabet.length; i++) {
            request({
                uri: "http://fr.igraal.com/codes-promo/"+alphabet[i].toUpperCase()
            }, function(error, response, body) {
                var c = cheerio.load(body);
                c(".tablesorter tbody tr").each(function() {
                    var siteCoupon = c(this);
                    var webShopName = siteCoupon.find('a').text();
                    var webshopUrl = siteCoupon.find('a').attr('href');
                    if(!isNaN(parseInt(siteCoupon.find('span[class=vouchers-number]').text()))) {
                        request({
                            uri: webshopUrl
                        }, function(pageError, pageResponse, pageBody) {
                            if (!pageError && pageResponse.statusCode == 200) {
                                var d = cheerio.load(pageBody);
                                d(".widget-vouchers-v2").each(function () {
                                    var detail = d(this);
                                    var productName = detail.find('.text-spliter').text();
                                    var uid = crypto.createHash('md5').update(productName).digest('hex');
                                    if(detail.find('.btn.btn-voucher').text().trim().toLowerCase().replace(/ /g, '') =='utiliserlecode') {
                                        var code = detail.find('.voucher-button.btn-with-voucher div').text();
                                        content.count({uid:uid}, function (error, count) {
                                            if(count == 0 ) {
                                                var promise = content.insert({
                                                    uid: uid,
                                                    website: websiteName,
                                                    shopName: webShopName.trim().toLowerCase().replace(/ /g, ''),
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
                                                    country: 'fr',
                                                    hasCode:1,
                                                    code:code
                                                });
                                                promise.on('success', function (err, doc) {
                                                    console.log("essen code : " + code);

                                                });
                                            }
                                        });

                                    } else {
                                        content.count({uid:uid}, function (error, count) {
                                            if(count == 0 ) {
                                                var promise = content.insert({
                                                    uid: uid,
                                                    website: websiteName,
                                                    shopName: webShopName.trim().toLowerCase().replace(/ /g, ''),
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
                                                    country: 'fr',
                                                    hasCode:0
                                                });
                                                promise.on('success', function (err, doc) {
                                                    console.log("essen offer : " + websiteName);

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

        }








    };
};

module.exports = function () {
    var instance = new Igaal_fr();
    return instance;
};