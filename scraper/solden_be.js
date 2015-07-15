var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var util = require("util");
var websiteName = 'solden';
var media_ids = require('../media_ids/germany');
var websiteUrl  ='http://www.solden.be';
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


var Solden_be = function () {




    this.fetchData = function () {


        var MyDate = new Date();
        MyDate.setMonth(MyDate.getMonth() + 6);
        var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
            + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
            + MyDate.getFullYear();
        request({
            uri: "http://www.solden.be/webshops"
        }, function(error, response, body) {

            var c = cheerio.load(body);
            c("ul.webshopGroup li a").each(function() {
                var siteCoupon = c(this);
                var webshopName =  siteCoupon.text();

                if(typeof siteCoupon.attr('href') != 'undefined')
                    request({
                        uri: siteCoupon.attr('href')
                    }, function(pageError, pageResponse, pageBody) {

                        if(!pageError && pageResponse.statusCode==200) {
                            var d = cheerio.load(pageBody);
                            d(".coupon ").each(function() {
                                var detail = d(this);
                                var productName = detail.find('h3').text().trim();
                                var uid = crypto.createHash('md5').update(productName).digest('hex');
                                var shopNameSlug = webshopName.trim().toLowerCase().replace(/ /g, '');

                                if(detail.find('.label.expired.hide-xs').text().trim() != 'Verlopen') {
                                    if(detail.find('.couponBottomWrapper span[class=show-xs]').text().trim().toLowerCase().replace(/ /g, '')=='codeopenen'){
                                        request({
                                            uri: 'http://www.solden.be/'+shopNameSlug+'?open='+detail.attr('data-id')+'#'+detail.attr('data-id')
                                        }, function(codeError, codeResponse, codeBody) {
                                            if(!codeError) {
                                                if(typeof codeBody != 'undefined') {
                                                    var code = cheerio.load(codeBody);
                                                    content.count({uid:uid}, function (error, count) {
                                                        if(count == 0 ) {
                                                            if(code('.coupon-code').text() != '') {
                                                                var promise = content.insert({
                                                                    uid: uid,
                                                                    website: websiteName,
                                                                    shopName: detail.find('.shop img').attr('alt').trim().toLowerCase().replace(/ /g, ''),
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
                                                                    code:code('.coupon-code').text()
                                                                });
                                                                promise.on('success', function (err, doc) {
                                                                    console.log("essen code : " + code('.coupon-code').text());

                                                                });
                                                            }

                                                        }
                                                    });
                                                }
                                            }

                                        });
                                    } else {
                                        content.count({uid:uid}, function (error, count) {
                                            if(count == 0 ) {
                                                var promise = content.insert({
                                                    uid: uid,
                                                    website: websiteName,
                                                    shopName: detail.find('.shop img').attr('alt').trim().toLowerCase().replace(/ /g, ''),
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
    var instance = new Solden_be();
    return instance;
};