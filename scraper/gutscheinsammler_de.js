var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var media_ids = require('../media_ids/germany');
var content = db.get(mongoCollection);
var util = require("util");
var websiteName = 'gutscheinsammler';
var websiteUrl  ='http://www.gutscheinsammler.de';
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

var Gutscheinsammler = function () {




    this.fetchData = function () {


        request({
            uri: "http://www.gutscheinsammler.de/shops"
        }, function(error, response, body) {
            var c = cheerio.load(body);
            c(".shoplist-single-shop").each(function() {
                var siteCoupon = c(this);
                var webshopName = siteCoupon.find('a').text();
                    console.log(websiteUrl+siteCoupon.find('a').attr('href'));
                request({
                    uri: websiteUrl+siteCoupon.find('a').attr('href')
                }, function(pageError, pageResponse, pageBody) {
                    if(!pageError && pageResponse.statusCode==200) {
                        var d = cheerio.load(pageBody);
                        d(".single-voucher.co-novel").each(function() {
                            var detail = d(this);
                            if(detail.find('a.codebutton').text().replace(/ /g,'').toLowerCase().replace(/\r?\n|\r/g, " ").trim()=='zuraktion') {
                                var productName = detail.find('.info h3').text();
                                var uid = crypto.createHash('md5').update(productName).digest('hex');
                                var siteExpireDate =  detail.find('.expiredate').text().replace(' Gültig bis ','').replace('.','-').replace('.2015','-2015');
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
                                            offerExpireDate: siteExpireDate,
                                            media_id:  matching.mediaMatchingDe(productName,media_ids),
                                            deleted: 0,
                                            lastUpdated: 0,
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


            });

        });









    };
};

module.exports = function () {
    var instance = new Gutscheinsammler();
    return instance;
};