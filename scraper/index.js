
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

            case "flipit_at":
                var flipit_at = require('./flipit_at.js');
                var flipit_at = flipit_at('localhost:27017/scrapedcontent');
                flipit_at.fetchData();
            break;

            case "flipit_us":
                var flipit_us = require('./flipit_us.js');
                var flipit_us = flipit_us('localhost:27017/scrapedcontent');
                flipit_us.fetchData();
            break;

            case "flipit_ca":
                var flipit_ca = require('./flipit_ca.js');
                var flipit_ca = flipit_ca('localhost:27017/scrapedcontent');
                flipit_ca.fetchData();
            break;


            case "flipit_sg":
                var flipit_sg = require('./flipit_sg.js');
                var flipit_sg = flipit_sg('localhost:27017/scrapedcontent');
                 flipit_sg.fetchData();
            break;

            case "flipit_ch":
                var flipit_ch = require('./flipit_ch.js');
                var flipit_ch = flipit_ch('localhost:27017/scrapedcontent');
                flipit_ch.fetchData();
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
                //arseFlitItWebsite('flipit_sg');
            break;

            case "iprice_sg":
                var iprice_sg = require('./iprice_sg.js');
                var iprice_sg = iprice_sg('localhost:27017/scrapedcontent');
                iprice_sg.fetchData();
                 parseFlitItWebsite('flipit_sg');
            break;

            case "cuponation_ch":
                var cuponation_ch = require('./cuponation_ch.js');
                var cuponation_ch = cuponation_ch('localhost:27017/scrapedcontent');
                cuponation_ch.fetchData();
                 parseFlitItWebsite('flipit_ch');
            break;

            case "gutschein_ch":
                var gutschein_ch = require('./gutschein_ch.js');
                var gutschein_ch = gutschein_ch('localhost:27017/scrapedcontent');
                gutschein_ch.fetchData();
                parseFlitItWebsite('flipit_ch');
            break;

            case "gutschein_blick_ch":
                var gutscheine_blick_ch = require('./gutscheine_blick_ch.js');
                var gutscheine_blick_ch = gutscheine_blick_ch('localhost:27017/scrapedcontent');
                gutscheine_blick_ch.fetchData();
                parseFlitItWebsite('flipit_ch');
            break;

            case 'infograz_at':
                var infograz_at = require('./infograz_at.js');
                var infograz_at = infograz_at('localhost:27017/scrapedcontent');
                infograz_at.fetchData();
                parseFlitItWebsite('flipit_at');
            break;

            case 'cuponation_at':
                var cuponation_at = require('./cuponation_at.js');
                var cuponation_at = cuponation_at('localhost:27017/scrapedcontent');
                cuponation_at.fetchData();
                parseFlitItWebsite('flipit_at');
            break;

            case 'coupons_us':
                var coupons_us = require('./coupons_us.js');
                var coupons_us = coupons_us('localhost:27017/scrapedcontent');
                coupons_us.fetchData();
            break;

            case 'valpak_ca':
                var valpak_ca = require('./valpak_ca.js');
                var valpak_ca = valpak_ca('localhost:27017/scrapedcontent');
                valpak_ca.fetchData();
            break;

            case 'bargainmoose_ca':
                var bargainmoose_ca = require('./bargainmoose_ca.js');
                var bargainmoose_ca = bargainmoose_ca('localhost:27017/scrapedcontent');
                bargainmoose_ca.fetchData();
            break;

        }
    };


};

module.exports = function (scraper) {
    var instance = new Scraper();

    instance.setScraper(scraper);

    return instance;
};