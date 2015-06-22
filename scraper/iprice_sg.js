var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var websiteName = "iprice_sg";
var media_ids = require('../media_ids/singapore');
var websiteUrl = 'http://www.iprice.sg';
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
var Iprice_sg = function () {
    this.fetchData = function () {
        request({
            uri: "http://iprice.sg/stores/"
        }, function(error, response, body) {
            var c = cheerio.load(body);
            c("#stores a").each(function() {
                var coupon = c(this);
                if (!error && response.statusCode == 200) {
                   var webshopName =  String(coupon.find('img').attr('alt')).replace(' Coupons & Discount Codes','');
                   var pageUrl = websiteUrl+coupon.attr('href');
                    request({
                        url:pageUrl
                    }, function(pageErr,pageRes,pageBody) {
                        if(!pageErr && pageRes.statusCode==200) {
                            var date = new Date();
                            var d = cheerio.load(pageBody);
                            var futureTimestamp =86400 * 60;
                            d('.item.active').each(function() {
                                var scrapeStartDate = ('0' + date.getDate()).slice(-2) + '-'
                                    + ('0' + (date.getMonth()+1)).slice(-2) + '-'
                                    + date.getFullYear();
                                var detail = d(this);
                                if(detail.find('footer a').text().trim() == "Get this Offer") {
                                    var productName =  detail.find('h3').text().trim();
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
                                                media_id:  matching.mediaMatchingSg(productName,media_ids),
                                                lastUpdated: 0,
                                                country: 'sg'
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
    var instance = new Iprice_sg();
    return instance;
};