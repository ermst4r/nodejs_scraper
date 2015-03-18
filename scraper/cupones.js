var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var websiteName = "cupones";


var Cupones = function () {

  this.fetchData = function () {
        request({
    uri: "http://www.cupones.es/cupones-descuento-por-categorias",
}, function(error, response, body) {
    var $ = cheerio.load(body);
    var baseUrl = "http://www.cupones.es/";
    $(".category-list .l-shops-container").each(function() {
        var links = $(this);
        request({
            uri: baseUrl+links.find(".title-link").attr("href"),
        }, function(error, response, body) {
            var $ = cheerio.load(body);
            $(".coupon-item-content").each(function() {
                var coupon = $(this);
                if(coupon.find(".button-text").text()=="Accede a la oferta") {
                    var shopName = coupon.find(".coupon-title-link").text().split("      ");
                    if(typeof shopName[1] !== "undefined") {
                        var uid = crypto.createHash('md5').update(websiteName+shopName[1].replace("en","")+coupon.find(".coupon-title-link").text()+baseUrl+coupon.find(".coupon-title-link").attr("href")).digest('hex');

                        content.count({uid:uid}, function (error, count) {
                            if(count == 0 ) {
                                var pName = coupon.find(".coupon-title-link").text().replace("      "," ").slice(0,-1).replace("  ","");
                                var promise = content.insert({
                                    uid: uid,
                                    website: websiteName,
                                    shopName: shopName[1].replace("en", "").slice(0,-1).trim(),
                                    productName:pName ,
                                    productUrl: baseUrl + coupon.find(".coupon-title-link").attr("href"),
                                    orginProductName: crypto.createHash('md5').update(pName).digest('hex'),
                                    newProductName: crypto.createHash('md5').update(pName).digest('hex'),
                                    updated:0

                                });
                                promise.on('success', function(err, doc){
                                    console.log("done");
                                });
                                promise.on('error', function(err, doc){
                                    console.log("something went wrong");
                                });
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