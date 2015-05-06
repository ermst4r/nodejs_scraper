
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

            case "cuponesmagicos":
                var cuponesmagicos = require('./cuponesmagicos.js');
                var cuponesmagicos = cuponesmagicos('localhost:27017/scrapedcontent');
                cuponesmagicos.fetchData();
            break;

            case "flipit_es":
                var flipites = require('./flipit_es.js');
                var flipites = flipites('localhost:27017/scrapedcontent');
                flipites.fetchData();
            break;

            case "gutscheincodes":
                var gutscheincodes = require('./gutscheincodes_de.js');
                var gutscheincodes = gutscheincodes('localhost:27017/scrapedcontent');
                gutscheincodes.fetchData();
            break;
            case "flipit_de":
                var flipit_de = require('./flipit_de.js');
                var flipit_de = flipit_de('localhost:27017/scrapedcontent');
                flipit_de.fetchData();
                break;




        }


    };


};

module.exports = function (scraper) {
    var instance = new Scraper();

    instance.setScraper(scraper);

    return instance;
};