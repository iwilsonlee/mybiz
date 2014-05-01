
/*
 * GET home page.
 */

var Goods = require('../models/goods');
var Merchant = require('../models/merchant.js');
var MerchantSite = require('../models/siteinfo.js');
var site = require('../settings.js').site;
var URL = require('url');
//var cache = require("node-smple-cache").createCache("LRU", 100 * 100 * 10);
var cache = require("../models/mycache");


module.exports = function(app){

//    app.get("/",checkCache);
    app.get("/",function(req, res){
        res.redirect('/index');
    });

//    app.get("/index",checkCache);
    app.get("/index", function(req, res){
        /*
        var hostname = req.host;
        var arr = cache.get(hostname);
        if(arr){
            var siteinfo = arr[0];
            var merchant = arr[1];
            res.render('index', { title: 'Express' });
        }else{
            res.send('此域名不存在！');
        }
        */
        res.render('index', { title: 'Express' });

    });

    app.get("/goods/:index", function(req, res){
        var index = (parseInt(req.params.index)-1)*site.indexGoodsAmout;
        Goods.find(index, site.indexGoodsAmout, Goods.makeStatus().normal,function(err, allGoods , total){
            res.render('goods', {
                allGoods: allGoods,
                previous_page: (parseInt(req.params.index)-1),
                next_page: (parseInt(req.params.index)+1),
                last_page:(Math.floor(total/site.indexGoodsAmout)+1),
                current_page:req.params.index,
                total: total
            });
        });
    });

    app.get("/show/:gid", function(req, res){
        var gid = parseInt(req.params.gid);
        Goods.getByGid(gid,function(err,goods){
            if(err){
                res.send(err);
            }else{
                res.render('show', { goods: goods });
            }

        });
    });

    app.get("/about", function(req, res){
        res.render('about', { title: 'Express' });
    });

    app.get("/contact", function(req, res){
        res.render('contact', { title: 'Express' });
    });


    function checkCache(req,res,next){
        var hostname = 'wj.520608.com';//URL.parse(req.url).hostname;

        var data = cache.get(hostname);
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
//                cache.createCache("LRU", 100 * 100 * 10);
                        cache.set(hostname, arr, 1000 * 60 * 30);
                        next();
                    });
                }else{
                    next();
                }

            });
        }else{
            next();
        }
    }

};

