var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var scraper = require('./routes/scraper');
var app = express();

var cupones = require('./scraper/cupones.js');
var getcupones = cupones();
getcupones.fetchData();


//request({
//    uri: "http://www.cupones.es/cupones-descuento-por-categorias",
//}, function(error, response, body) {
//    var $ = cheerio.load(body);
//    var baseUrl = "http://www.cupones.es/";
//    var jsonArr = [];
//    var teller = 0;
//    $(".category-list .l-shops-container").each(function() {
//        var links = $(this);
//        request({
//            uri: baseUrl+links.find(".title-link").attr("href"),
//        }, function(error, response, body) {
//            var $ = cheerio.load(body);
//            $(".coupon-item-content").each(function() {
//                var coupon = $(this);
//                if(coupon.find(".button-text").text()=="Accede a la oferta") {
//                    var shopName = coupon.find(".coupon-title-link").text().split("      ");
//
//                    if(typeof shopName[1] !== "undefined") {
//                        //console.log(shopName[1].replace("en",""));
//                        //console.log(coupon.find(".coupon-title-link").text());
//                        //console.log(coupon.find(".coupon-title-link").attr("href"));
//                        jsonArr.push ({
//                            shopName:shopName[1].replace("en",""),
//                            productName:coupon.find(".coupon-title-link").text(),
//                            productUrl:baseUrl+coupon.find(".coupon-title-link").attr("href")
//                        });
//                        console.log(jsonArr);
//
//                    }
//                }
//            });
//        });
//    });
//});







// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/scraper',scraper);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.get('/', function (req, res) {
    res.send('Hello World!')
})

var server = app.listen(3000, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)

})


module.exports = app;
