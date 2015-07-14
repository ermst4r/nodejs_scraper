var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var trim = require('trim');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var websiteName = "zflipit_fr";
var websiteUrl = 'http://www.flipit.com/fr/';
var util = require("util");
var parsedJSON = require('../shopnames/fr_match.json');
var jsonFile = parsedJSON;
var matching = require('./../models/matching');
var matching = matching();
var countryCode = 'fr';
console.log('start');

var Flipit_fr = function () {
    this.fetchData = function () {
        var date = new Date();
        var scrapeStartDate = ('0' + date.getDate()).slice(-2) + '-'
            + ('0' + (date.getMonth()+1)).slice(-2) + '-'
            + date.getFullYear();
        var uriPath = new Array();
        uriPath[0] = 'magasins-09-e';
        uriPath[1] = 'magasins-f-j';
        uriPath[2] = 'magasins-k-o';
        uriPath[3] = 'magasins-p-t';
        uriPath[4] = 'magasins-u-z';

        content.remove({ "website": websiteName }, function (err) {
            if (err) throw err;
        });



        for (var z = 0; z<uriPath.length;  z++) {
            request({
                uri: websiteUrl + uriPath[z]
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var p = cheerio.load(body);
                    p('.content-holder ul li a').each(function () {
                        var pDetail = p(this);
                        request({
                            uri: pDetail.attr('href')

                        }, function (pageError, pageResponse, pageBody) {
                            if (!pageError && pageResponse.statusCode == 200) {
                                var d = cheerio.load(pageBody);
                                var shopName = String(d('.radiusImg').attr('alt'));
                                d('.holder.offer-holder').each(function () {
                                    var detail = d(this);
                                    var productName = detail.find('h3 a').text().replace(/^\s+|\s+$/g, '');
                                    var isOffer = detail.find('.btn-code').text();
                                    var uid = crypto.createHash('md5').update(productName).digest('hex');
                                    // code section
                                    var internalId = detail.attr("id");
                                    var codeUrl = "http://www.flipit.com/"+countryCode+"/"+shopName.trim().toLowerCase().replace(/ /g, '')+"?popup="+internalId+"&type=code#"+internalId;


                                    if (isOffer.trim().toLowerCase().replace(/ /g, '') == 'découvrirl\'offre') {
                                        content.count({uid: uid}, function (error, count) {
                                            if (count == 0) {
                                                if (jsonFile.indexOf(shopName.trim().toLowerCase().replace(/ /g, '')) > 0) {
                                                    var promise = content.insert({
                                                        uid: uid,
                                                        website: websiteName,
                                                        shopName: shopName.trim().toLowerCase().replace(/ /g, ''),
                                                        productName: productName,
                                                        orginProductName: crypto.createHash('md5').update(productName + websiteName).digest('hex'),
                                                        newProductName: crypto.createHash('md5').update(productName + websiteName).digest('hex'),
                                                        orginProductNameUnhashed: productName + websiteName,
                                                        updated: 0,
                                                        scrapeStartDate: scrapeStartDate,
                                                        deleted: 0,
                                                        lastUpdated: 0,
                                                        country: countryCode,
                                                        flipit:1,
                                                        hasCode:0
                                                    });
                                                    promise.on('success', function (err, doc) {
                                                        console.log("essen offer : " + shopName.trim().toLowerCase().replace(/ /g, ''));

                                                    });
                                                    promise.on('error', function (err, doc) {

                                                    });
                                                }
                                            }
                                        });
                                    }
                                    if(detail.find('.offer-teaser-button.kccode').text()=='VOIR LE CODE') {
                                        if(codeUrl !='') {
                                            request({
                                                uri: codeUrl
                                            }, function (jsonError, jsonResponse, jsonBody) {
                                                //console.log(jsonBody);
                                                if (typeof jsonResponse !== 'undefined') {
                                                    var codePage = cheerio.load(jsonBody);
                                                    codePage('article.block.active').each(function () {
                                                        var codeDetail = codePage(this);
                                                        if (internalId == codeDetail.find('.holder.offer-holder').attr('id')) {
                                                            if( typeof codeDetail.find('img.small-code').attr('alt') !== 'undefined') {
                                                                var promise = content.insert({
                                                                    uid: uid,
                                                                    website: websiteName,
                                                                    shopName: shopName.trim().toLowerCase().replace(/ /g, ''),
                                                                    productName: productName,
                                                                    orginProductName: crypto.createHash('md5').update(productName + websiteName).digest('hex'),
                                                                    newProductName: crypto.createHash('md5').update(productName + websiteName).digest('hex'),
                                                                    orginProductNameUnhashed: productName + websiteName,
                                                                    updated: 0,
                                                                    scrapeStartDate: scrapeStartDate,
                                                                    deleted: 0,
                                                                    lastUpdated: 0,
                                                                    country: countryCode,
                                                                    flipit: 1,
                                                                    hasCode: 1,
                                                                    code: codeDetail.find('.code-value').text()
                                                                });
                                                                promise.on('success', function (err, doc) {
                                                                    console.log("essen code : " + shopName.trim().toLowerCase().replace(/ /g, ''));

                                                                });
                                                            }


                                                        }
                                                    });

                                                }

                                            });
                                        }
                                    }


                                });
                            }
                        });


                    });
                }

            });
        }




    };
};

module.exports = function () {
    var instance = new Flipit_fr();
    return instance;
};