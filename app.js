
/**
 * Module dependencies.
 */

var express = require('express');
var cpanel = require('./routes/cpanel');
var index = require('./routes/index');

var Merchant = require('./models/merchant.js');
var MerchantSite = require('./models/siteinfo.js');
var URL = require('url');
var cache = require("./models/mycache");

var http = require('http');
var path = require('path');
var ejs = require('ejs');
var fs = require('fs');
var MongoStore = require('connect-mongo')(express);
var flash = require('connect-flash');
var settings = require('./settings').mongo;
var groupHandlers = require('express-group-handlers');
var accessLogfile = fs.createWriteStream('access.log', {flags: 'a'});
var errorLogfile = fs.createWriteStream('error.log', {flags: 'a'});

var app = express();
//var app = module.exports = express.createServer();
// all environments
app.set('port', process.env.PORT || 3000);
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.use(flash());
app.use(express.logger({stream: accessLogfile}));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());

var store;
if(settings.user){
    store = new MongoStore({
        db: settings.db,
        username: settings.user,
        password: settings.password
    })
}else{
    store = new MongoStore({
        db: settings.db
    })
}
app.use(express.session({
    secret: settings.cookieSecret,
    key: settings.db,
    cookie: {maxAge: 1000 * 3600 * 24 * 7},
    store: store
}));

/*
app.use(function(req, res, next){
    var hostname = 'wj.520608.com';//URL.parse(req.url).hostname;
    var mycache = cache.createCache("LRU", 100 * 100 * 10);
    var data = mycache.get(hostname);
    if(!data){
        MerchantSite.getByUrl(hostname, function(err, siteinfo){
            if(err){
                var error = '数据错误，或者此域名不存在！'
                res.locals.message = '<div class="alert alert-error">' + error + '</div>';
            }
            if(siteinfo){
                var mySiteinfo = new MerchantSite(siteinfo);
                Merchant.getByMid(mySiteinfo.mid, function(err, merchant){
                    if(err){
                        var error = '数据错误，或者此商户不存在！'
                        res.locals.message = '<div class="alert alert-error">' + error + '</div>';
                    }
                    var arr = [mySiteinfo,merchant];
//                mycache.createCache("LRU", 100 * 100 * 10);
                    mycache.set(hostname, arr, 1000 * 60);
                    next();
                });
            }else{
                next();
            }

        });
    }

});
*/

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.error(function(err, req, res, next) {
        var meta = '[' + new Date() + '] ' + req.url + '\n';
        errorLogfile.write(meta + err.stack + '\n');
        next();
    });
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

groupHandlers.setup(app);

cpanel(app);
app.get("/check", function(req, res){
    res.send(new Date());
});
app.beforeEach(grouphandler, function(app){
    index(app);
});

function grouphandler(req, res, next){
//    var hostname = 'wj.520608.com';//URL.parse(req.url).hostname;
    var hostname = req.host;
    var data = cache.get(hostname);

    if(!data){
        MerchantSite.getByUrl(hostname, function(err, siteinfo){
            if(err){
                var error = '数据错误，或者此域名不存在！'
                res.locals.message = '<div class="alert alert-error">' + error + '</div>';
                next();
            }
            if(siteinfo){
                var mySiteinfo = new MerchantSite(siteinfo);
                Merchant.getByMid(mySiteinfo.mid, function(err, merchant){
                    if(err){
                        var error = '数据错误，或者此商户不存在！'
                        res.locals.message = '<div class="alert alert-error">' + error + '</div>';
                        next();
                    }
                    if(merchant){
                        var arr = [mySiteinfo,merchant];
                        cache.set(hostname, arr, 1000 * 60 * 30);
                        res.locals.mySite = arr[0];
                        res.locals.myMerchant = arr[1];
                        next();
                    }else{
                        res.send('此域名不存在！');
                    }

                });
            }else{
                res.send('此域名不存在！');
            }

        });
    }else{
        res.locals.mySite = data[0];
        res.locals.myMerchant = data[1];
        next();
    }

   // next();
}


var myserver = http.createServer(app);
module.exports = myserver;
if(!module.parent){
    myserver.listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
}
//http.createServer(app).listen(app.get('port'), function(){
//  console.log('Express server listening on port ' + app.get('port'));
//});
