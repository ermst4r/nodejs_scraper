var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var websiteName = "cuponation_ch";
var media_ids = require('../media_ids/swiss');
var websiteUrl = 'http://www.cuponation.ch';
var util = require("util");
var parsedJSON = require('../shopnames');
var jsonFile = parsedJSON;
var matching = require('../models/matching');
matching = matching();
var Cuponation_ch = function () {




    this.fetchData = function () {

        request({
            uri: "http://www.cuponation.ch/alleshops"
        }, function(error, response, body) {
            var c = cheerio.load(body);

            c(".cn-alphabet-list ul li a").each(function() {
                var coupon = c(this);

                if (!error && response.statusCode == 200) {
                    var pageUrl =  websiteUrl+coupon.attr('href');
                    var webshopName = coupon.text();

                    request({
                        url:pageUrl
                    }, function(pageErr,pageRes,pageBody) {
                        if(!pageErr && pageRes.statusCode==200) {
                            var date = new Date();
                            var d = cheerio.load(pageBody);
                            var futureTimestamp =86400 * 60;
                            d('.cn-voucher.deal.action-btn-on-right').each(function() {
                                var scrapeStartDate = ('0' + date.getDate()).slice(-2) + '-'
                                    + ('0' + (date.getMonth()+1)).slice(-2) + '-'
                                    + date.getFullYear();

                                var detail = d(this);
                                if(detail.find('footer span.text').text()=='Deal anzeigen') {
                                    var productName = detail.find('h3').text().replace("-", "").replace("+", "").replace("\"", "");
                                    var siteEndDate = String(detail.attr('data-end-date'));
                                    var endDate = (Date.parse(siteEndDate) / 1000) + futureTimestamp;
                                    var uid = crypto.createHash('md5').update(productName).digest('hex');
                                    var MyDate = new Date();
                                    MyDate.setMonth(MyDate.getMonth() + 6);
                                    var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
                                        + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
                                        + MyDate.getFullYear();
                                    content.count({uid: uid}, function (error, count) {
                                        if (count == 0) {
                                            var promise = content.insert({
                                                uid: uid,
                                                website: websiteName,
                                                shopName: webshopName.trim().toLowerCase().replace(/ /g, ''),
                                                productName: productName.toString('UTF-8'),
                                                orginProductName: crypto.createHash('md5').update(productName).digest('hex'),
                                                newProductName: crypto.createHash('md5').update(productName).digest('hex'),
                                                orginProductNameUnhashed: productName,
                                                updated: 0,
                                                scrapeStartDate: scrapeStartDate,
                                                offerExpireDate: finalActionExpireDate,
                                                deleted: 0,
                                                country:"ch",
                                                lastUpdated: 0
                                            });
                                            promise.on('success', function (err, doc) {
                                                console.log("essen " + webshopName.trim().toLowerCase().replace(/ /g, ''));

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
    var instance = new Cuponation_ch();
    return instance;
};