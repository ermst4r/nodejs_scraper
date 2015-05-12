var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var websiteName = "cupon_es";
var media_ids = require('../media_ids/spain');
var websiteUrl = 'http://www.cupon.es/';
var util = require("util");
var parsedJSON = require('../shopnames');
var jsonFile = parsedJSON;
var matching = require('../models/matching');
matching = matching();

var Cupones_es = function () {
    this.fetchData = function () {
        request({
            uri: "http://cupon.es/tiendas"
        }, function(error, response, body) {
            var c = cheerio.load(body);

            c(".list-unstyled.list-three-cols a").each(function() {
                var coupon = c(this);
                if (!error && response.statusCode == 200) {
                    var date = new Date();
                    var webshopName = coupon.text().trim();

                    var pageUrl = websiteUrl+coupon.attr('href');
                    request({
                        url:pageUrl
                    },  function(pageErr,pageRes,pageBody) {
                        if(!pageErr && pageRes.statusCode==200) {
                            var d = cheerio.load(pageBody);
                            d('.card.card-coupons-list.pannacotta ul li .col-xs-12').each(function() {
                                var detail = d(this);
                                var offertas = detail.find('.coupon-cta a').text().replace(/ /g,'').toLowerCase().replace(/\r?\n|\r/g, " ").trim(); // remove newline, space at end and beginnign, and remove all spaces

                                if(offertas !='' && offertas =='veroferta') {
                                    if(detail.find('.coupon-title').text() !='') {

                                        var productName = detail.find('.coupon-title').text().replace(/\r?\n|\r/g, " ").trim().replace("-","").replace("+","").replace("\"",""); // remove newline, space at end
                                        var scrapeStartDate = ('0' + date.getDate()).slice(-2) + '-'
                                            + ('0' + (date.getMonth()+1)).slice(-2) + '-'
                                            + date.getFullYear();

                                        //the endDate
                                        var MyDate = new Date();
                                        MyDate.setMonth(MyDate.getMonth() + 6);
                                        var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
                                            + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
                                            + MyDate.getFullYear();


                                        var theWebshop = webshopName.replace(/ *\([^)]*\) */g, "");
                                        var uid = crypto.createHash('md5').update(productName).digest('hex');
                                        content.count({uid:uid}, function (error, count) {
                                            if(count == 0 ) {
                                                if (jsonFile.indexOf(theWebshop.trim().toLowerCase().replace(/ /g, '')) > 0) {
                                                    var promise = content.insert({
                                                        uid: uid,
                                                        website: websiteName,
                                                        shopName: theWebshop.trim().toLowerCase().replace(/ /g, ''),
                                                        productName: productName,
                                                        orginProductName: crypto.createHash('md5').update(productName).digest('hex'),
                                                        newProductName: crypto.createHash('md5').update(productName).digest('hex'),
                                                        updated: 0,
                                                        scrapeStartDate: scrapeStartDate,
                                                        offerExpireDate: finalActionExpireDate,
                                                        deleted: 0,
                                                        orginProductNameUnhashed: productName,
                                                        lastUpdated: 0,
                                                        country:"es",
                                                        media_id:  matching.mediaMatchingEs(productName,media_ids)
                                                    });
                                                    promise.on('success', function (err, doc) {
                                                        console.log("essen" + websiteName);

                                                    });

                                                }

                                            }

                                        });




                                    }
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
    var instance = new Cupones_es();
    return instance;
};