var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoConnectionString);
var content = db.get(mongoCollection);
var util = require("util");
var websiteName = 'gutscheinsammler';
var websiteUrl  ='http://www.gutscheinsammler.de';
var date = new Date();
var scrapeStartDate = ('0' + date.getDate()).slice(-2) + '-'
    + ('0' + (date.getMonth()+1)).slice(-2) + '-'
    + date.getFullYear();
var MyDate = new Date();
MyDate.setMonth(MyDate.getMonth() + 6);
var finalActionExpireDate = ('0' + MyDate.getDate()).slice(-2) + '-'
    + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
    + MyDate.getFullYear();

var Gutscheinsammler = function () {

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
                    return 128; // media id
                }


            }

        }
    }


    this.fetchData = function () {


        request({
            uri: "http://www.gutscheinsammler.de/shops"
        }, function(error, response, body) {
            var c = cheerio.load(body);
            c(".shoplist-single-shop").each(function() {
                var siteCoupon = c(this);
                var webshopName = siteCoupon.find('a').text();
                    console.log(websiteUrl+siteCoupon.find('a').attr('href'));
                request({
                    uri: websiteUrl+siteCoupon.find('a').attr('href')
                }, function(pageError, pageResponse, pageBody) {
                    if(!pageError && pageResponse.statusCode==200) {
                        var d = cheerio.load(pageBody);
                        d(".single-voucher.co-novel").each(function() {
                            var detail = d(this);
                            if(detail.find('a.codebutton').text().replace(/ /g,'').toLowerCase().replace(/\r?\n|\r/g, " ").trim()=='zuraktion') {
                                var productName = detail.find('.info h3').text();
                                var uid = crypto.createHash('md5').update(productName).digest('hex');
                                var siteExpireDate =  detail.find('.expiredate').text().replace(' Gültig bis ','').replace('.','-').replace('.2015','-2015');
                                content.count({uid:uid}, function (error, count) {
                                    if(count == 0 ) {
                                        var promise = content.insert({
                                            uid: uid,
                                            website: websiteName,
                                            shopName: webshopName.trim().toLowerCase().replace(/ /g, ''),
                                            productName: productName,
                                            orginProductName: crypto.createHash('md5').update(productName).digest('hex'),
                                            newProductName: crypto.createHash('md5').update(productName).digest('hex'),
                                            orginProductNameUnhashed: productName,
                                            updated: 0,
                                            scrapeStartDate: scrapeStartDate,
                                            offerExpireDate: siteExpireDate,
                                            deleted: 0,
                                            lastUpdated: 0,
                                            country: 'de'
                                        });
                                        promise.on('success', function (err, doc) {
                                            console.log("essen : " + websiteName);

                                        });
                                    }
                                });


                            }

                        });
                    }


                });


            });

        });









    };
};

module.exports = function () {
    var instance = new Gutscheinsammler();
    return instance;
};