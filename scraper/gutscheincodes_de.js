var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var util = require("util");
var websiteName = 'gutscheincodes';
var date = new Date();
var scrapeStartDate = ('0' + date.getDate()).slice(-2) + '-'
    + ('0' + (date.getMonth()+1)).slice(-2) + '-'
    + date.getFullYear();
var MyDate = new Date();
MyDate.setMonth(MyDate.getMonth() + 6);
var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
    + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
    + MyDate.getFullYear();
var parsedJSON = require('../shopnames/de');

var Gutscheincodes = function () {

    var mediaMatching = function(productName)   // Only visible inside Restaurant()
    {
        for(var i =0; i<media_ids.length; i++) {
            var obj = media_ids[i];
            var str = productName;
            var numbers = str.match(/\d+/g);
            if(numbers != null) {
                for(var x =0; x <numbers.length; x++) {
                    var re = new RegExp(numbers[x]+'€')
                    var re2 = new RegExp(numbers[x]+'%')
                    if(re.test(str.replace(/ /g,'')) == true) {
                        if(obj.media_title ==numbers[x] +'€') {
                            return obj.media_id;
                        }
                    }
                    if(re2.test(str.replace(/ /g,'')) == true) {
                        if(obj.media_title ==numbers[x] +'%') {
                            return obj.media_id;
                        }
                    }
                }
            } else {
                var re = new RegExp('gratis');
                if(re.test(str.replace(/ /g,'')) == true) {
                    return 128; // media id
                }


            }

        }
    }


    this.fetchData = function () {




        request({
            uri: "http://gutscheincodes.de/shops/"
        }, function(error, response, body) {
            var c = cheerio.load(body);

            c(".box.vendor-column-list ul li a").each(function() {
                var coupon = c(this);
                var pageUrl =  coupon.attr('href');
                var webshopName = coupon.text();
                if(typeof pageUrl !== 'undefined') {
                    request({
                        uri: pageUrl
                    }, function(pageError, pageResponse, pageBody) {
                        if(!pageError && pageResponse.statusCode==200) {

                            var d = cheerio.load(pageBody);
                            d("ul.detail-list-vendor li").each(function() {
                                var detail = d(this);
                                if(detail.find('footer').text() =='Rabatt-Aktion') {
                                    var productName = detail.find('.info.has-promotion p').text();
                                    var uid = crypto.createHash('md5').update(productName).digest('hex');
                                    content.count({uid:uid}, function (error, count) {
                                        if(count == 0 ) {
                                            if (parsedJSON.indexOf(webshopName.toLowerCase().replace(/ /g, '')) > 0) {
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
                                                    lastUpdated: 0,
                                                    country: 'de'
                                                });
                                                promise.on('success', function (err, doc) {
                                                    console.log("essen : " + websiteName);

                                                });
                                            }

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
    var instance = new Gutscheincodes();
    return instance;
};