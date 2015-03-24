var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var websiteName = "cupones";
var spanishDate = Array('enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre');

var Cupones = function () {




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
                    endUnixTimeStamp=Date.parse(d.getFullYear()+'-06-'+'31') / 1000;
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
                                var pName = coupon.find(".coupon-title-link").text().replace("      "," ").slice(0,-1).replace("  ","");
                                var promise = content.insert({
                                    uid: uid,
                                    website: websiteName,
                                    shopName: shopName[1].replace("en", "").slice(0,-1).trim(),
                                    productName:pName ,
                                    productUrl: baseUrl + coupon.find(".coupon-title-link").attr("href"),
                                    orginProductName: crypto.createHash('md5').update(pName).digest('hex'),
                                    newProductName: crypto.createHash('md5').update(pName).digest('hex'),
                                    updated:0,
                                    scrapeStartDate:scrapeStartDate,
                                    offerExpireDate:finalActionExpireDate,
                                    deleted:0

                                });
                                promise.on('success', function(err, doc){
                                    console.log("essen");

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