
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

    var parseFlitItWebsite = function(flipit) {
        var flipit = require('./'+flipit+'.js');
        var flipit = flipit('localhost:27017/scrapedcontent');
        flipit.fetchData();
    }

    this.parseWebsite = function()
    {
        switch(this.getScraper()) {
            case "cupones":
                var cupones = require('./cupones.js');
                var getcupones = cupones('localhost:27017/scrapedcontent');
                getcupones.fetchData();
                parseFlitItWebsite('flipit_es');

            break;
            case "cuponation":
                var cuponation = require('./cuponation.js');
                var getcuponation = cuponation('localhost:27017/scrapedcontent');
                getcuponation.fetchData();
                parseFlitItWebsite('flipit_es');
            break;

            case "cupon_es":
                var cuponation = require('./cupon_es.js');
                var getcupon_es = cuponation('localhost:27017/scrapedcontent');
                getcupon_es.fetchData();
                parseFlitItWebsite('flipit_es');
            break;

            case "cuponesmagicos":
                var cuponesmagicos = require('./cuponesmagicos.js');
                var cuponesmagicos = cuponesmagicos('localhost:27017/scrapedcontent');
                cuponesmagicos.fetchData();
                parseFlitItWebsite('flipit_es');
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
                parseFlitItWebsite('flipit_de');
            break;

            case "gutscheinsammler":
                var gutscheinsammler = require('./gutscheinsammler_de.js');
                var gutscheinsammler = gutscheinsammler('localhost:27017/scrapedcontent');
                gutscheinsammler.fetchData();
                parseFlitItWebsite('flipit_de');
            break;

            case "sparwelt":
                var sparwelt = require('./sparwelt_de.js');
                var sparwelt = sparwelt('localhost:27017/scrapedcontent');
                sparwelt.fetchData();
                parseFlitItWebsite('flipit_de');
                break;

            case "flipit_de":
                var flipit_de = require('./flipit_de.js');
                var flipit_de = flipit_de('localhost:27017/scrapedcontent');
                flipit_de.fetchData();
            break;

            case "flipit_in":
                var flipit_in = require('./flipit_in.js');
                var flipit_in = flipit_in('localhost:27017/scrapedcontent');
                flipit_in.fetchData();
            break;

            case "flipit_sg":
                var flipit_sg = require('./flipit_sg.js');
                var flipit_sg = flipit_sg('localhost:27017/scrapedcontent');
                 flipit_sg.fetchData();
            break;

            case "gutscheinpony_de":
                var gutscheinpony_de = require('./gutscheinpony_de.js');
                var gutscheinpony_de = gutscheinpony_de('localhost:27017/scrapedcontent');
                gutscheinpony_de.fetchData();
                parseFlitItWebsite('flipit_de');
            break;

            case "cashkaro_in":
                var cashkaro = require('./cashkaro_in.js');
                var cashkaro = cashkaro('localhost:27017/scrapedcontent');
                cashkaro.fetchData();
                parseFlitItWebsite('flipit_in');
            break;

            case "cuponation_in":
                var cuponation_in = require('./cuponation_in.js');
                var cuponation_in = cuponation_in('localhost:27017/scrapedcontent');
                cuponation_in.fetchData();
                parseFlitItWebsite('flipit_in');
            break;
            case "couponraja_in":
                var couponraja_in = require('./couponraja_in.js');
                var couponraja_in = couponraja_in('localhost:27017/scrapedcontent');
                couponraja_in.fetchData();
                parseFlitItWebsite('flipit_in');
            break;

            case "couponzguru_in":
                var couponzguru_in = require('./couponzguru_in.js');
                var couponzguru_in = couponzguru_in('localhost:27017/scrapedcontent');
                couponzguru_in.fetchData();
                parseFlitItWebsite('flipit_in');
            break;

            case "cuponation_sg":
                var cuponation_sg = require('./cuponation_sg.js');
                var cuponation_sg = cuponation_sg('localhost:27017/scrapedcontent');
                cuponation_sg.fetchData();
               // parseFlitItWebsite('flipit_sg');
            break;

            case "iprice_sg":
                var iprice_sg = require('./iprice_sg.js');
                var iprice_sg = iprice_sg('localhost:27017/scrapedcontent');
                iprice_sg.fetchData();
               // parseFlitItWebsite('flipit_sg');
            break;




        }


    };


};

module.exports = function (scraper) {
    var instance = new Scraper();

    instance.setScraper(scraper);

    return instance;
};