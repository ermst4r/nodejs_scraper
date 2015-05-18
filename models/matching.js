var levenshtein = require('levenshtein');
var parsedJSON = require('../shopnames/es.json');
Matching = function () {


    this.flipitShop = function (jsonArray) {

        for(var i = 0; i<jsonArray.length; i++){
            var obj = JSON.parse(jsonArray);
            console.log(obj[i]);
        }
    };


    this.mediaMatchingDe = function(productName,media_ids)   // Only visible inside Restaurant()
    {
        var found = false;

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
                            found = true;
                            return obj.media_id;
                        }
                    }
                    if(re2.test(str.replace(/ /g,'')) == true) {
                        if(obj.media_title ==numbers[x] +'%') {
                            found = true;
                            return obj.media_id;
                        }
                    }
                }
            } else {
                var re = new RegExp('gratis');
                if(re.test(str.replace(/ /g,'')) == true) {
                    found = true;
                    return 114; // media id
                }
            }
        }

        if(found == false) {
            var RandGeneralTile = [117,118,119,120,121,146];
            return RandGeneralTile[Math.floor(Math.random() * RandGeneralTile.length)];
        }
    }




    this.mediaMatchingEs = function(productName,media_ids)   // Only visible inside Restaurant()
    {
        var found = false;

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
                            found = true;
                            return obj.media_id;
                        }
                    }
                    if(re2.test(str.replace(/ /g,'')) == true) {
                        if(obj.media_title ==numbers[x] +'%') {
                            found = true;
                            return obj.media_id;
                        }
                    }
                }
            } else {
                var re = new RegExp('gratis');
                if(re.test(str.replace(/ /g,'')) == true) {
                    found = true;
                    return 128; // media id
                }
            }
        }

        if(found == false) {
            var RandGeneralTile = [128,122,126,75,70,186];
            return RandGeneralTile[Math.floor(Math.random() * RandGeneralTile.length)];
        }
    }


    this.mediaMatchingIn = function(productName,media_ids)   // Only visible inside Restaurant()
    {
        var found = false;

        for(var i =0; i<media_ids.length; i++) {
            var obj = media_ids[i];
            var str = productName;
            var numbers = str.match(/\d+/g);

            if(numbers != null) {
                for(var x =0; x <numbers.length; x++) {
                    var re2 = new RegExp(numbers[x]+'%')

                    if(re2.test(str.replace(/ /g,'')) == true) {
                        if(obj.media_title ==numbers[x] +'%') {
                            found = true;
                            return obj.media_id;
                        }
                    }
                }
            }
        }

        if(found == false) {
            var RandGeneralTile = [110,109,91,37,36];
            return RandGeneralTile[Math.floor(Math.random() * RandGeneralTile.length)];
        }
    }






      this.checkDistance = function (string1,string2,grade) {
        var l = levenshtein(string1,string2);
        var pVerschil = string1.length  - l;
        var percentage = (pVerschil / string1.length * 100);
        if(percentage >= grade) {
            return true;
        } else {
            return false;
        }
    };


};

module.exports = function () {
    var instance = new Matching();
    return instance;
};
