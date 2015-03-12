var request = require("request");
var cheerio = require("cheerio");

var Cupones = function () {
    this.fetchData = function () {
        request({
    uri: "http://www.cupones.es/cupones-descuento-por-categorias",
}, function(error, response, body) {
    var $ = cheerio.load(body);
    var baseUrl = "http://www.cupones.es/";
    var jsonArr = [];
    var teller = 0;
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
                        //console.log(shopName[1].replace("en",""));
                        //console.log(coupon.find(".coupon-title-link").text());
                        //console.log(coupon.find(".coupon-title-link").attr("href"));
                        jsonArr.push ({
                            shopName:shopName[1].replace("en",""),
                            productName:coupon.find(".coupon-title-link").text(),
                            productUrl:baseUrl+coupon.find(".coupon-title-link").attr("href")
                        });
                        console.log(jsonArr);

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