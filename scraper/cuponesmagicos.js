var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var websiteName = "cuponesmagicos";
var media_ids = require('../media_ids/spain');
var websiteUrl = 'http://www.cuponesmagicos.com/';
var util = require("util");
var Cuponesmagicos = function () {

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
            uri: "http://www.cuponesmagicos.com/tiendas"
        }, function(error, response, body) {
            if(!error && response.statusCode==200) {
                var d = cheerio.load(body);
                d('.main-content ul li').each(function() {
                    var detail = d(this);
                    var shopUrl = detail.find('a').attr("href");
                    var shopName = detail.find('a').text().replace(/^\s+|\s+$/g, '');
                    var date = new Date();
                    request({
                        uri: shopUrl
                    }, function(pageError, pageResponse, pageBody) {
                        if(!pageError && pageResponse.statusCode==200) {
                            var p = cheerio.load(pageBody);
                            p('.coupons-list article').each(function() {
                                var pDetail = p(this);
                                if(pDetail.find('span.clickoutlink').attr('isoffer')=='true') {
                                    var productName = pDetail.find('span.clickoutlink').attr('data-couponname').trim().replace(/\r?\n|\r/g, " ");
                                    var scrapeStartDate = ('0' + date.getDate()).slice(-2) + '-'
                                        + ('0' + (date.getMonth()+1)).slice(-2) + '-'
                                        + date.getFullYear();
                                    //the endDate
                                    var MyDate = new Date();
                                    MyDate.setMonth(MyDate.getMonth() + 6);
                                    var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
                                        + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
                                        + MyDate.getFullYear();
                                     var uid = crypto.createHash('md5').update(productName+websiteName).digest('hex');


                                     content.count({uid:uid}, function (error, count) {
                                        if(count == 0 ) {
                                            var promise = content.insert({
                                                uid: uid,
                                                website: websiteName,
                                                shopName: shopName,
                                                productName:productName ,
                                                orginProductName: crypto.createHash('md5').update(productName).digest('hex'),
                                                newProductName: crypto.createHash('md5').update(productName).digest('hex'),
                                                orginProductNameUnhashed:productName,
                                                updated:0,
                                                scrapeStartDate:scrapeStartDate,
                                                offerExpireDate:finalActionExpireDate,
                                                deleted:0,
                                                media_id:mediaMatching(productName),
                                                lastUpdated:0
                                            });
                                            promise.on('success', function(err, doc){
                                                console.log("essen : " + websiteName);

                                            });

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
    var instance = new Cuponesmagicos();
    return instance;
};