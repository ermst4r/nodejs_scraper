var levenshtein = require('levenshtein');
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
                return this.mediaMatchingEs(productName,mediaIds);
            break;
            case 'de':
                return this.mediaMatchingDe(productName,mediaIds);
            break;
            case 'in':
                return this.mediaMatchingIn(productName,mediaIds);
            break;
            case 'sg':
                return this.mediaMatchingSg(productName,mediaIds);
            break;
            case 'at':
                return this.mediaMatchingAt(productName,mediaIds);
            break;
            case 'ch':
                return this.mediaMatchingCh(productName,mediaIds);
            break;
            case 'us':
                return this.mediaMatchingUs(productName,mediaIds);
            break;
            case 'be':
                return this.mediaMatchingBe(productName,mediaIds,0);
            break;

            case 'be_code':
                return this.mediaMatchingBe(productName,mediaIds,1);
            break;

            case 'fr':
                return this.mediaMatchingFr(productName,mediaIds,0);
            break;

            case 'fr_code':
                return this.mediaMatchingFr(productName,mediaIds,1);
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
            case 'sg':
                var media_ids = require('../media_ids/singapore');
            break;
            case 'at':
                var media_ids = require('../media_ids/austria');
            break;
            case 'ch':
                var media_ids = require('../media_ids/swiss');
            break;
            case 'us':
                var media_ids = require('../media_ids/unitedstates');
            break;
            case 'ca':
            var media_ids = require('../media_ids/canada');
            break;
            case 'be':
                var media_ids = require('../media_ids/be');
            break;
            case 'fr':
                var media_ids = require('../media_ids/fr');
            break;

            case 'fr_code':
                var media_ids = require('../media_ids/fr_code');
            break;

            case 'be_code':
                var media_ids = require('../media_ids/be_code');
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


    this.mediaMatchingUs = function(productName,media_ids)   // Only visible inside Restaurant()
    {
        var found = false;

        for(var i =0; i<media_ids.length; i++) {
            var obj = media_ids[i];
            var re = new RegExp("\\b("+String(obj.media_title).toLowerCase()+")\\b");
            var result = re.exec(String(productName).replace("$","dollar").replace("%","percent").toLowerCase().replace(/(-?\d*\,\d+|\d*\.\d+)/, ""));
            if(result != null) {
                found = true;
                return obj.media_id;
            }
        }
        if(found == false) {
            var RandGeneralTile = [73];
            return RandGeneralTile[Math.floor(Math.random() * RandGeneralTile.length)];
        }
    }



    this.mediaMatchingBe = function(productName,media_ids,hasCode)   // Only visible inside Restaurant()
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
            if(hasCode == 0) {
                var RandGeneralTile = [72,70,44];
            } else {
                var RandGeneralTile = [71];
            }

            return RandGeneralTile[Math.floor(Math.random() * RandGeneralTile.length)];
        }
    }



    this.mediaMatchingFr= function(productName,media_ids,hasCode)   // Only visible inside Restaurant()
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
            if(hasCode == 0) {
                var RandGeneralTile = [63,49,47];
            } else {
                var RandGeneralTile = [193,192,177];
            }

            return RandGeneralTile[Math.floor(Math.random() * RandGeneralTile.length)];
        }
    }




    this.mediaMatchingCa = function(productName,media_ids)   // Only visible inside Restaurant()
    {
        var found = false;
        for (var i = 0; i < media_ids.length; i++) {
            var obj = media_ids[i];
            var re = new RegExp("\\b(" + String(obj.media_title).toLowerCase() + ")\\b");
            var result = re.exec(String(productName).replace("$", "dollar").replace("%", "percent").toLowerCase().replace(/(-?\d*\,\d+|\d*\.\d+)/, ""));
            if (result != null) {
                found = true;
                return obj.media_id;
            }
        }
        if (found == false) {
            var RandGeneralTile = [94];
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
            var RandGeneralTile = [122,126,75,70,186];
            return RandGeneralTile[Math.floor(Math.random() * RandGeneralTile.length)];
        }
    }


    this.mediaMatchingAt = function(productName,media_ids)   // Only visible inside Restaurant()
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
            var RandGeneralTile = [63,49,47];
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


    this.mediaMatchingCh = function(productName,media_ids)   // Only visible inside Restaurant()
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
            var RandGeneralTile = [97,39,35];
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
