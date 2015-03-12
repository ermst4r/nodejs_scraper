
var Scraper = function () {
    this.data = {
        scraper: null
    };

    this.setScraper = function (scraper) {
        this.data.scraper = scraper;


    };

    this.getScraper = function()
    {
        return this.data.scraper;
    };

    this.parseWebsite = function()
    {
        switch(this.getScraper()) {
            case "cupones":
                var cupones = require('./cupones.js');
                var getcupones = cupones();
                getcupones.fetchData();
            break;

        }


    };


};

module.exports = function (scraper) {
    var instance = new Scraper();

    instance.setScraper(scraper);

    return instance;
};