var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var websiteName = "infograz_at";
var media_ids = require('../media_ids/austria');
var websiteUrl = 'http://www.info-graz.at';
var util = require("util");
var parsedJSON = require('../shopnames');
var jsonFile = parsedJSON;
var MyDate = new Date();
var matching = require('../models/matching');
var MyDate = new Date();
MyDate.setMonth(MyDate.getMonth() + 6);
var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
    + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
    + MyDate.getFullYear();

matching = matching();
var Infograz_at = function () {

    this.fetchData = function () {
        request({
            uri: "http://www.info-graz.at/gutscheine/alle-gutscheine-2/"
        }, function(error, response, body) {
            var c = cheerio.load(body);
            c(".llg-alle-gutscheine-link a").each(function() {
                var coupon = c(this);
                if (!error && response.statusCode == 200) {
                    var webshopName = coupon.text();
                    var pageUrl = coupon.attr('href');
                    request({
                        url:pageUrl
                    }, function(pageErr,pageRes,pageBody) {
                        if(!pageErr && pageRes.statusCode==200) {
                            var date = new Date();
                            var d = cheerio.load(pageBody);
                            var futureTimestamp =86400 * 60;
                            d('.llg-gutschein.single').each(function() {
                                var scrapeStartDate = ('0' + date.getDate()).slice(-2) + '-'
                                    + ('0' + (date.getMonth()+1)).slice(-2) + '-'
                                    + date.getFullYear();
                                var pageDetail = d(this);
                                if(pageDetail.find('.llg-gutschein-visit a').text() =='Angebot anzeigen und Shop öffnen') {
                                    var productName =  pageDetail.find('.couponvalue').text();
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
                                                media_id:  matching.mediaMatchingAt(productName,media_ids),
                                                deleted: 0,
                                                lastUpdated: 0,
                                                country: 'at'
                                            });
                                            promise.on('success', function (err, doc) {
                                                console.log("essen : " + productName);

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
    var instance = new Infograz_at();
    return instance;
};