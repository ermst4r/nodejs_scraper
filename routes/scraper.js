var express = require('express');
var router = express.Router();
var cupones = require('../scraper/cupones.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    cupones.triggerArrive();
    res.send("hallo");

});

module.exports = router;

