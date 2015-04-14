var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var websiteName = "cupones";
var spanishDate = Array('enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre');
var media_ids = require('../media_ids/spain');
var util = require("util");
var parsedJSON = require('../shopnames');
var jsonFile = parsedJSON;




var Cupones = function () {

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
    uri: "http://www.cupones.es/cupones-descuento-por-categorias",
}, function(error, response, body) {
    var $ = cheerio.load(body);
    var baseUrl = "http://www.cupones.es/";
    var d = new Date();
    $(".category-list .l-shops-container").each(function() {
        var links = $(this);
        request({
            uri: baseUrl+links.find(".title-link").attr("href"),
        }, function(error, response, body) {
            var $ = cheerio.load(body);
            $(".coupon-item-content").each(function() {
                var coupon = $(this);
                // get end date of site
                var splitDate = coupon.find('.date').text().split(" ");
                var scrapeStartDate = ('0' + d.getDate()).slice(-2) + '-'
                    + ('0' + (d.getMonth()+1)).slice(-2) + '-'
                    + d.getFullYear();

                var endUnixTimeStamp = '';
                var futureTimestamp =86400 * 60;
                if(splitDate[2]=='desconocido') {
                    endUnixTimeStamp=Date.parse(d.getFullYear()+'-06-'+'30') / 1000;
                } else {
                    var getMonth ='';
                    if(spanishDate.indexOf(splitDate[4]) > -1) {
                        getMonth = spanishDate.indexOf(splitDate[4])+ 1;
                    }
                    endUnixTimeStamp =(Date.parse(d.getFullYear()+'-'+getMonth+'-'+splitDate[2]) + futureTimestamp ) / 1000;

                }
                var MyDate = new Date( parseInt(endUnixTimeStamp*1000));
                var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
                + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
                + MyDate.getFullYear();

                if(coupon.find(".button-text").text()=="Accede a la oferta") {
                    var shopName = coupon.find(".coupon-title-link").text().split("      ");
                    if(typeof shopName[1] !== "undefined") {
                        var uid = crypto.createHash('md5').update(websiteName+shopName[1].replace("en","")+coupon.find(".coupon-title-link").text()+baseUrl+coupon.find(".coupon-title-link").attr("href")).digest('hex');

                        content.count({uid:uid}, function (error, count) {
                            if(count == 0 ) {
                                    if (jsonFile.indexOf(shopName[1].replace("en", "").slice(0, -1).trim().toLowerCase().replace(/ /g, '')) > 0) {
                                        var pName = coupon.find(".coupon-title-link").text().replace("      ", "").slice(0, -1).replace("  ", "");
                                        var promise = content.insert({
                                            uid: uid,
                                            website: websiteName,
                                            shopName: shopName[1].replace("en", "").slice(0, -1).trim().toLowerCase().replace(/ /g, ''),
                                            productName: pName,
                                            orginProductName: crypto.createHash('md5').update(pName).digest('hex'),
                                            orginProductNameUnhashed: pName,
                                            newProductName: crypto.createHash('md5').update(pName).digest('hex'),
                                            updated: 0,
                                            scrapeStartDate: scrapeStartDate,
                                            offerExpireDate: finalActionExpireDate,
                                            deleted: 0,
                                            media_id: mediaMatching(pName),
                                            lastUpdated: 0
                                        });
                                        promise.on('success', function (err, doc) {
                                            console.log(util.inspect(pName));


                                        });
                                        promise.on('error', function (err, doc) {
                                            console.log("something went wrong");
                                        });
                                    }


                            }
                         });
                     }
                }
                });
            });

        });
    });

    };
};

module.exports = function () {
    var instance = new Cupones();
    return instance;
};