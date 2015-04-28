var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var websiteName = "cuponation";
var media_ids = require('../media_ids/spain');
var websiteUrl = 'http://www.cuponation.es';
var util = require("util");
var parsedJSON = require('../shopnames');
var jsonFile = parsedJSON;
var Cuponation = function () {

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
                    return 50; // media id
                }


            }

        }
    }


    this.fetchData = function () {

        request({
            uri: "http://www.cuponation.es/todaslasmarcas"
        }, function(error, response, body) {
            var c = cheerio.load(body);
            c(".cn-alphabet-list .letter a").each(function() {
                var coupon = c(this);
                if (!error && response.statusCode == 200) {
                    var pageUrl =  websiteUrl+coupon.attr('href');
                    var webshopName = coupon.text();
                    // do another request
                    request({
                        url:pageUrl
                    }, function(pageErr,pageRes,pageBody) {
                        if(!pageErr && pageRes.statusCode==200) {
                            var date = new Date();
                            var d = cheerio.load(pageBody);
                            var futureTimestamp =86400 * 60;
                            d('.voucher.deal.custom-text').each(function() {


                                var scrapeStartDate = ('0' + date.getDate()).slice(-2) + '-'
                                    + ('0' + (date.getMonth()+1)).slice(-2) + '-'
                                    + date.getFullYear();
                                var detail = d(this);
                                if(detail.find('span.alarm-icon').text()!='Caducado') {
                                    var productName = detail.find('h3').text().replace("-", "").replace("+", "").replace("\"", "");
                                    var siteEndDate = String(detail.attr('data-end-date'));
                                    var endDate = (Date.parse(siteEndDate) / 1000) + futureTimestamp;
                                    var uid = crypto.createHash('md5').update(productName).digest('hex');
                                    var MyDate = new Date(parseInt(endDate * 1000));
                                    var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
                                        + ('0' + (MyDate.getMonth() + 1)).slice(-2) + '-'
                                        + MyDate.getFullYear();


                                    content.count({uid: uid}, function (error, count) {
                                        if (count == 0) {
                                            if (jsonFile.indexOf(webshopName.trim().toLowerCase().replace(/ /g, '')) > 0) {
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
                                                    media_id: (mediaMatching(productName)==null) ? 182 : mediaMatching(productName),
                                                    lastUpdated: 0
                                                });
                                                promise.on('success', function (err, doc) {
                                                    console.log("essen" + websiteName);

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
    var instance = new Cuponation();
    return instance;
};