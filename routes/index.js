
/*
 * GET home page.
 */

var Goods = require('../models/goods');
var Merchant = require('../models/merchant.js');
var MerchantSite = require('../models/siteinfo.js');
var site = require('../settings.js').site;
var URL = require('url');
//var cache = require("node-smple-cache").createCache("LRU", 100 * 100 * 10);
var cache = require("../models/mycache").getCache;


module.exports = function(app){

//    app.get("/",checkCache);
    app.get("/",function(req, res){
        res.redirect('/index');
    });

//    app.get("/index",checkCache);
    app.get("/index", function(req, res){
        res.render('index');

    });

    app.get("/goods", function(req, res){
        var index = 0;//(parseInt(req.params.index)-1)*site.indexGoodsAmout;
        Goods.find(index, site.indexGoodsAmout, Goods.makeStatus().normal,function(err, allGoods , total){
            res.render('goods', {
                allGoods: allGoods,
//                previous_page: (parseInt(req.params.index)-1),
                next_page: (parseInt(req.params.index)+1),
                last_page:(Math.floor(total/site.indexGoodsAmout)+1),
//                current_page:req.params.index,
                total: total,
                indexGoodsAmout: site.indexGoodsAmout
            });
        });
    });

    app.post("/goods", function(req, res){
        var index = (parseInt(req.body.index)-1)*site.indexGoodsAmout;
        Goods.find(index, site.indexGoodsAmout, Goods.makeStatus().normal,function(err, allGoods , total){
            res.render('goods_page_content', {
                allGoods: allGoods,
//                previous_page: (parseInt(req.params.index)-1),
                next_page: (parseInt(req.body.index)+1),
                last_page:(Math.floor(total/site.indexGoodsAmout)+1),
//                current_page:req.params.index,
                total: total
            });
        });
    });

    app.get("/goods/show/:gid", function(req, res){
        var gid = parseInt(req.params.gid);
        Goods.getByGid(gid,function(err,goods){
            if(err){
                res.send(err);
            }else{
                var title = '';
                if(!goods || !goods.salesInfo || goods.salesInfo == 'undefined'){
                    title = res.locals.title;
                }else{
                    title = goods.salesInfo;
                }
                res.render('show', { goods: goods, title: title });
            }

        });
    });

    app.get("/about", function(req, res){
        res.render('about');
    });

    app.get("/contact", function(req, res){
        res.render('contact');
    });




};

