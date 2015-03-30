
var Scraper = function () {
    this.data = {
        scraper: null,
        mongoConnection:'localhost:27017/scrapedcontent'
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
                var getcupones = cupones('localhost:27017/scrapedcontent');
                getcupones.fetchData();

            break;
            case "cuponation":
                var cuponation = require('./cuponation.js');
                var getcuponation = cuponation('localhost:27017/scrapedcontent');
                getcuponation.fetchData();
            break;

            case "cupon_es":
                var cuponation = require('./cupon_es.js');
                var getcupon_es = cuponation('localhost:27017/scrapedcontent');
                getcupon_es.fetchData();
            break;




        }


    };


};

module.exports = function (scraper) {
    var instance = new Scraper();

    instance.setScraper(scraper);

    return instance;
};