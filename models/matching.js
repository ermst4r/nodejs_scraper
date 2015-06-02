var levenshtein = require('levenshtein');
var parsedJSON = require('../shopnames/es.json');
Matching = function () {


    this.flipitShop = function (jsonArray) {

        for(var i = 0; i<jsonArray.length; i++){
            var obj = JSON.parse(jsonArray);
            console.log(obj[i]);
        }
    };


    this.matchingFactory = function(country,productName,mediaIds)
    {
        switch(country) {
            case 'es':
                return this.mediaMatchingEs(productName,mediaIds)
            break;

            case 'de':
                return this.mediaMatchingDe(productName,mediaIds)
            break;

            case 'in':
                return this.mediaMatchingIn(productName,mediaIds)
            break;

            case 'sg':
                return this.mediaMatchingSg(productName,mediaIds)
            break;
        }
    },

    this.loadMediaIds = function(country)
    {
        switch(country) {
            case 'es':
                var media_ids = require('../media_ids/spain');
            break;
            case 'de':
                var media_ids = require('../media_ids/germany');
            break;
            case 'in':
                var media_ids = require('../media_ids/india');
            break;
        }

        return media_ids;

    },


    this.mediaMatchingDe = function(productName,media_ids)   // Only visible inside Restaurant()
    {
        var found = false;

        for(var i =0; i<media_ids.length; i++) {
            var obj = media_ids[i];
            var re = new RegExp("\\b("+String(obj.media_title).toLowerCase()+")\\b");
            var result = re.exec(String(productName).replace("€","euro").replace("%","percent").toLowerCase().replace(/(-?\d*\,\d+|\d*\.\d+)/, ""));
            if(result != null) {
                found = true;
                return obj.media_id;
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
            var re = new RegExp("\\b("+String(obj.media_title).toLowerCase()+")\\b");
            var result = re.exec(String(productName).replace("€","euro").replace("%","percent").toLowerCase().replace(/(-?\d*\,\d+|\d*\.\d+)/, ""));
            if(result != null) {
                found = true;
                return obj.media_id;
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
            var re = new RegExp("\\b("+String(obj.media_title).toLowerCase()+")\\b");
            var result = re.exec(String(productName).replace("€","euro").replace("%","percent").toLowerCase().replace(/(-?\d*\,\d+|\d*\.\d+)/, ""));
            if(result != null) {
                found = true;
                return obj.media_id;
            }
        }
        if(found == false) {
            var RandGeneralTile = [110,109,91,37,36];
            return RandGeneralTile[Math.floor(Math.random() * RandGeneralTile.length)];
        }
    }


    this.mediaMatchingSg = function(productName,media_ids)   // Only visible inside Restaurant()
    {
        var found = false;
        for(var i =0; i<media_ids.length; i++) {
            var obj = media_ids[i];
            var re = new RegExp("\\b("+String(obj.media_title).toLowerCase()+")\\b");
            var result = re.exec(String(productName).replace("€","euro").replace("%","percent").toLowerCase().replace(/(-?\d*\,\d+|\d*\.\d+)/, ""));
            if(result != null) {
                found = true;
                return obj.media_id;
            }
        }
        if(found == false) {
            var RandGeneralTile = [76,60,91,37,36];
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
