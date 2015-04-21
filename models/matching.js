var levenshtein = require('levenshtein');
var parsedJSON = require('../shopnames/es.json');
Matching = function () {


    this.flipitShop = function (jsonArray) {

        for(var i = 0; i<jsonArray.length; i++){
            var obj = JSON.parse(jsonArray);
            console.log(obj[i]);
        }
    };


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
