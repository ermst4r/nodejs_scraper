var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var trim = require('trim');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var websiteName = "flipit_es";
var websiteUrl = 'http://www.flipit.com/es/';
var util = require("util");
var parsedJSON = require('../shopnames');
var jsonFile = parsedJSON;


var Flipt_es = function () {

    this.fetchData = function () {
        var date = new Date();
        var scrapeStartDate = ('0' + date.getDate()).slice(-2) + '-'
            + ('0' + (date.getMonth()+1)).slice(-2) + '-'
            + date.getFullYear();





        request({
            uri: websiteUrl+'todas-las-tiendas-09-e'
        }, function(error, response, body) {
            if(!error && response.statusCode==200) {
                var p = cheerio.load(body);
                p('.content-holder ul li a').each(function() {
                    var pDetail = p(this);
                    var shopName = pDetail.text().replace(/^\s+|\s+$/g,'');
                    request({
                        uri: pDetail.attr('href')
                    }, function(pageError, pageResponse, pageBody) {
                        if(!pageError && pageResponse.statusCode==200) {
                            var d = cheerio.load(pageBody);
                            d('.holder.offer-holder').each(function() {
                                var detail = d(this);
                                var productName = detail.find('h3 a').text().replace(/^\s+|\s+$/g,'');
                                var isOffer = detail.find('.btn-code').attr('vote');
                                var uid = crypto.createHash('md5').update(productName+websiteName).digest('hex');
                                if(isOffer != '0') {
                                    content.count({uid: uid}, function (error, count) {
                                        if (count == 0) {
                                            if (jsonFile.indexOf(shopName.trim().toLowerCase().replace(/ /g, '')) > 0) {
                                                var promise = content.insert({
                                                    uid: uid,
                                                    website: websiteName,
                                                    shopName: shopName,
                                                    productName: productName,
                                                    orginProductName: crypto.createHash('md5').update(productName).digest('hex'),
                                                    newProductName: crypto.createHash('md5').update(productName).digest('hex'),
                                                    orginProductNameUnhashed: productName,
                                                    updated: 0,
                                                    scrapeStartDate: scrapeStartDate,
                                                    deleted: 0,
                                                    lastUpdated: 0
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


                });
            }
        });




    };
};

module.exports = function () {
    var instance = new Flipt_es();
    return instance;
};