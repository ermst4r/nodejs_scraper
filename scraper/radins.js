var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var util = require("util");
var websiteName = 'radins';
var media_ids = require('../media_ids/germany');
var websiteUrl  ='http://www.radins.com/';
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
var parsedJSON = require('../shopnames/fr');

var Radins_fr = function () {

     var seoUrl = function(txt_src) {
            var output = txt_src.replace(/[^a-zA-Z0-9]/g,' ').replace(/\s+/g,"-").toLowerCase();
            /* remove first dash */
            if(output.charAt(0) == '-') output = output.substring(1);
            /* remove last dash */
            var last = output.length-1;
            if(output.charAt(last) == '-') output = output.substring(0, last);

            return output;

    }


    this.fetchData = function () {
        var MyDate = new Date();
        MyDate.setMonth(MyDate.getMonth() + 6);
        var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
            + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
            + MyDate.getFullYear();
        parsedJSON.forEach(function(entry) {
            request({
                uri: 'http://www.radins.com/code-promo/'+seoUrl(entry)+'/'
            }, function(error, response, body) {
                if(response.statusCode == 200) {
                    var c = cheerio.load(body);
                    if(typeof c('.lh12.fs12.gpt15.gpr10.fc4.truncHeight2L.truncated').attr('id') != 'undefined') {
                        var id = String(c('.lh12.fs12.gpt15.gpr10.fc4.truncHeight2L.truncated').attr('id')).replace('desc_','');
                        var newUrl = 'http://www.radins.com/code-promo/'+seoUrl(entry)+'/?afficher=1&id_cp='+id;

                        request({
                            uri: newUrl
                        }, function(pageError, pageResponse, pageBody) {
                            if(pageResponse.statusCode == 200) {
                                var d = cheerio.load(pageBody);
                                d('.gmt30.cb').each(function() {
                                    var detail = c(this);
                                    var productName = detail.find('.titre.time_redirect.fc1.fs18.bold.lh14.lblur').text().trim();
                                    var uid = crypto.createHash('md5').update(productName).digest('hex');
                                    if(productName !='') {
                                        if( typeof detail.find('.b0.shadow0.left.gmt5.w60p.fs20.gmb0.gp5').attr('value') == 'undefined') {
                                            content.count({uid:uid}, function (error, count) {
                                                if(count == 0 ) {
                                                    var promise = content.insert({
                                                        uid: uid,
                                                        website: websiteName,
                                                        shopName: entry.trim().toLowerCase().replace(/ /g, ''),
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
                                                        country: 'fr',
                                                        hasCode:0

                                                    });
                                                    promise.on('success', function (err, doc) {
                                                        console.log("essen actie : " + websiteName);

                                                    });
                                                }
                                            });

                                        } else {
                                            content.count({uid:uid}, function (error, count) {
                                                if(count == 0 ) {
                                                    var promise = content.insert({
                                                        uid: uid,
                                                        website: websiteName,
                                                        shopName: entry.trim().toLowerCase().replace(/ /g, ''),
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
                                                        country: 'fr',
                                                        hasCode:1,
                                                        code:detail.find('.b0.shadow0.left.gmt5.w60p.fs20.gmb0.gp5').attr('value')
                                                    });
                                                    promise.on('success', function (err, doc) {
                                                        console.log( 'essen code' +detail.find('.b0.shadow0.left.gmt5.w60p.fs20.gmb0.gp5').attr('value'));

                                                    });
                                                }
                                            });
                                        }
                                    }

                                });
                            }
                        });

                    }

                }
            });


        });




    };
};

module.exports = function () {
    var instance = new Radins_fr();
    return instance;
};