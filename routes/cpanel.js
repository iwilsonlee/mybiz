
/*
 * GET users listing.
 */

var crypto = require('crypto');
var User = require('../models/user.js');
var Goods = require('../models/goods.js');
var Merchant = require('../models/merchant.js');
var MerchantSite = require('../models/siteinfo.js');
var validator = require('validator');
var site = require('../settings.js').site;
var formidable = require('formidable');
var sys = require('sys');
var fs = require("fs");
var path = require('path');

module.exports = function(app){

    app.get('/cpanel', function (req, res) {
        User.count(function(err, num){
            if(num != 0){
                if(!req.session.user){
                    res.render('cpanel/login', {
                        site: site,
                        success: req.flash('success').toString(),
                        error: req.flash('error').toString()
                    });
                }else{
                    res.render('cpanel/index', {
                        title: site.title,
                        site: site,
                        user: req.session.user,
                        success: req.flash('success').toString(),
                        error: req.flash('error').toString()
                    });
                }
            }else{
                res.redirect('/cpanel/reg');
            }
        });
    });

    app.post("/cpanel/login", function (req, res) {
        var password_md5 = crypto.createHash('md5').update(req.body.password).digest('hex');

        User.get(req.body.username, function (err, user) {
            if(err){
                req.flash('error', "Query Error!");
                return res.redirect('/cpanel');
            }

            if(!user){
                req.flash('error', 'User not exists!');
                return res.redirect('/cpanel');
            }

            if(user.password != password_md5){
                req.flash('error', 'Password incorrect!');
                return res.redirect('/cpanel');
            }

            req.session.user = 	user;
            req.flash('success', 'Successful!');
            res.redirect('/cpanel');
        });
    });

    app.get('/cpanel/reg', function (req, res) {
        try{
            var reg = require('./reg.js');
        }catch(e){
            throw e;
            if(e)return res.redirect('/cpanel');
        }
        reg.get(req, res);
    });

    app.post('/cpanel/reg', function (req, res) {
        try{
            var reg = require('./reg.js');
        }catch(e){
            if(e)return res.redirect('/cpanel');
        }
        reg.post(req, res);
    });

    app.get('/cpanel/logout', function (req, res) {
        site: site,
        req.session.user = null;
        req.flash('success', "Successful!");
        res.redirect('/cpanel');
    });

    app.get('/cpanel/merchants/:index', preCheckLogin);
    app.get('/cpanel/merchants/:index', function(req, res){
        var index = req.params.index-1;
        Merchant.findByPermission(index, site.indexMerchantAmount, Merchant.makePermission().normal, function(err, merchants, total){
            if(merchants){
                merchants = merchants.reverse();
            }else{
                merchants = [];
            }

            res.render('cpanel/merchants', {
                title: site.title,
                site: site,
                user: req.session.user,
                merchants: merchants,
                next_index: (index+site.indexMerchantAmount),
                total: total,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    app.post('/cpanel/merchants', preCheckLogin);
    app.post('/cpanel/merchants', function(req, res){

        if(!req.body.name||!req.body.username||!req.body.password||!req.body.email||!req.body.phone
            ||!req.body.address||!req.body.sitename||!req.body.title||!req.body.keywords
            ||!req.body.description||!req.body.url||!req.body.template){
            req.flash('error', '请填写完整所有输入项');
            res.redirect('/cpanel/merchants/1');
            return;
        }

        if(!validator.isAlphanumeric(req.body.username.trim())){
            req.flash('error', '帐号只能包含数字和字母');
            res.redirect('/cpanel/merchants/1');
            return;
        }

        if(req.body.password.trim().length<6){
            req.flash('error', '密码不能小于6位');
            res.redirect('/cpanel/merchants/1');
            return;
        }

        if(!validator.isEmail(req.body.email.trim())){
            req.flash('error', '请输入正确的email格式');
            res.redirect('/cpanel/merchants/1');
            return;
        }

        if(!validator.isNumeric(req.body.phone.trim())){
            req.flash('error', '请输入正确的电话号码格式');
            res.redirect('/cpanel/merchants/1');
            return;
        }
        if(!validator.isNumeric(req.body.mobile.trim())){
            req.flash('error', '请输入正确的手机号码格式');
            res.redirect('/cpanel/merchants/1');
            return;
        }

        if(!validator.isURL(req.body.url.trim())){
            req.flash('error', '请输入正确的url格式');
            res.redirect('/cpanel/merchants/1');
            return;
        }

        var password_md5 = crypto.createHash('md5').update(req.body.password).digest('hex');

        var merchantArr = {
            name: req.body.name,
            username: req.body.username,
            password: password_md5,
            email: req.body.email,
            phone: req.body.phone,
            mobile: req.body.mobile,
            fax:req.body.fax,
            address: req.body.address,
            createTime: new Date(),
            modifyTime:null,
            address: req.body.address,
            permission: Merchant.makePermission().normal,
            salesInfo:req.body.salesInfo
        };
        var siteinfo = {
            name: req.body.sitename,
            title: req.body.title,
            keywords: req.body.keywords,
            description: req.body.description,
            url: req.body.url,
            template: req.body.template,
            mid:null
        };

        var merchant = new Merchant(merchantArr);
        merchant.save(function(err , merchant){
            if(err){
                req.flash('error', err);
                return res.redirect('/cpanel/merchants/1');
            }
            siteinfo.mid = merchant[0].mid;
            siteinfo = new MerchantSite(siteinfo);
            siteinfo.save(function(err, siteinfo){
                if(err){
                    req.flash('error', err);
                    return res.redirect('/cpanel/merchants/1');
                }

                req.flash('success', 'Successful!');
                res.redirect('/cpanel/merchants/1');//发表成功
            });


        });
    });

    app.get('/cpanel/merchant-edit/:mid', preCheckLogin);
    app.get('/cpanel/merchant-edit/:mid', function(req, res){
        var mid = parseInt(req.params.mid);
        Merchant.getByMid(mid, function(err, merchant){
            if(err){
                req.flash('error', err);
                window.history.back();
                return
            }
            MerchantSite.getByMid(mid, function(err, siteinfo){
                if(err){
                    req.flash('error', err);
                    window.history.back();
                    return
                }
                res.render('cpanel/merchant-edit', {
                    title: site.title,
                    site: site,
                    user: req.session.user,
                    merchant: merchant,
                    siteinfo: siteinfo,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });

        })
    });

    app.post('/cpanel/merchant-edit/:mid', preCheckLogin);
    app.post('/cpanel/merchant-edit/:mid', function(req, res){
        var mid = parseInt(req.params.mid);
        if(!req.body.email||!req.body.phone
            ||!req.body.address||!req.body.sitename||!req.body.title||!req.body.keywords
            ||!req.body.description||!req.body.url||!req.body.template){
            req.flash('error', '请填写完整所有输入项');
            res.redirect('/cpanel/merchants/1');
            return;
        }

        if(req.body.password && req.body.password.trim().length<6){
            req.flash('error', '密码不能小于6位');
            res.redirect('/cpanel/merchants/1');
            return;
        }

        if(!validator.isEmail(req.body.email.trim())){
            req.flash('error', '请输入正确的email格式');
            res.redirect('/cpanel/merchants/1');
            return;
        }

        if(!validator.isNumeric(req.body.phone.trim())){
            req.flash('error', '请输入正确的电话号码格式');
            res.redirect('/cpanel/merchants/1');
            return;
        }

        if(!validator.isNumeric(req.body.mobile.trim())){
            req.flash('error', '请输入正确的手机号码格式');
            res.redirect('/cpanel/merchants/1');
            return;
        }

        if(!validator.isURL(req.body.url.trim())){
            req.flash('error', '请输入正确的url格式');
            res.redirect('/cpanel/merchants/1');
            return;
        }

        Merchant.getByMid(mid, function(err, doc){
            if(err){
                req.flash('error', err);
                res.redirect('/cpanel/merchant-edit/'+mid);
                return
            }
            var password_md5 = crypto.createHash('md5').update(req.body.password).digest('hex');
            doc.password = password_md5;
            doc.email = req.body.email;
            doc.phone = req.body.phone;
            doc.mobile = req.body.mobile;
            doc.fax = req.body.fax;
            doc.address = req.body.address;
            doc.modifyTime = new Date();
            doc.salesInfo = req.body.salesInfo;
            var merchant = new Merchant(doc);
            merchant.update(function(err, merchant){
                if(err){
                    req.flash('error', err);
                    res.redirect('/cpanel/merchant-edit/'+mid);
                    return
                }
                MerchantSite.getByMid(mid, function(err, si){
                    if(err){
                        req.flash('error', err);
                        res.redirect('/cpanel/merchant-edit/'+mid);
                        return
                    }
                    si.name = req.body.sitename;
                    si.title = req.body.title;
                    si.keywords = req.body.keywords;
                    si.description = req.body.description;
                    si.url = req.body.url;
                    si.template = req.body.template;

                    var siteinfo = new MerchantSite(si);

                    siteinfo.update(function(err,siteinfo){
                        if(err){
                            req.flash('error', err);
                            res.redirect('/cpanel/merchant-edit/'+mid);
                            return
                        }
                        req.flash('success', "修改成功！");
                        res.redirect('/cpanel/merchant-edit/'+mid);
                    });
                });

            });
        });
    });


    app.get('/cpanel/goods/:index', preCheckLogin);
    app.get('/cpanel/goods/:index', function(req, res){
        var index = (parseInt(req.params.index)-1)*site.indexGoodsAmout;
        Goods.find(index, site.indexGoodsAmout, Goods.makeStatus().normal, function(err, goods, total){
            if(goods){
                goods = goods;//.reverse();
            }else{
                goods = [];
            }

            res.render('cpanel/goods', {
                title: site.title,
                site: site,
                user: req.session.user,
                goods: goods,
                previous_page: (parseInt(req.params.index)-1),
                next_page: (parseInt(req.params.index)+1),
                last_page:(Math.floor(total/site.indexGoodsAmout)+1),
                current_page:req.params.index,
                total: total,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    app.post('/cpanel/goods', preCheckLogin);
    app.post('/cpanel/goods', function(req, res){


        //console.dir(req.files);
        var form = new formidable.IncomingForm();
        form.uploadDir = site.tmpPath;
        form.parse(req, function(err, fields, files) {
            if(!fields.name.trim()){
                req.flash('error', '请填写商品名称');
                res.redirect('/cpanel/goods/1');
                return;
            }
            if(!fields.description.trim()){
                req.flash('error', '请填写商品描述信息');
                res.redirect('/cpanel/goods/1');
                return;
            }

            if(!files || !files.img || !files.img1 || !files.img.name || !files.img1.name){
                req.flash('error', '请上传商品图片');
                res.redirect('/cpanel/goods/1');
                return;
            }

            if(files.img.size > 1024*40){
                req.flash('error', '商品小图大小不能超过40K');
                res.redirect('/cpanel/goods/1');
                return;
            }
            if(files.img1.size > 1024*400){
                req.flash('error', '商品大图大小不能超过400K');
                res.redirect('/cpanel/goods/1');
                return;
            }


            var dateNum = (new Date()).format("yyyyMMddhhmmss");
            Goods.countToday(function (err, num) {
                if (err) {
                    req.flash('error', '获取商品图片名称时发生错误');
                    res.redirect('/cpanel/goods/1');
                }
                else {
                    var d = dateNum + num;
//                    var extension = path.extname(path.basename(files.img.path));
//                    var extension1 = path.extname(path.basename(files.img1.path));
                    var extension = files.img.name.substr(files.img.name.indexOf('.'),files.img.name.length);
                    var extension1 = files.img1.name.substr(files.img1.name.indexOf('.'),files.img1.name.length);
                    var imgName = d + extension;
                    var img1Name = d + "a" + extension1;

                    //处理图片上传
                    if(site.imgExtension.contains(extension)){
                        fs.renameSync(files.img.path, site.goodsFilePath + "//" + imgName);
                    }else{
                        req.flash('error', '上传的小图片格式只能是JPG,GIF,PNG中的一种');
                        res.redirect('/cpanel/goods/1');
                        return;
                    }

                    if(site.imgExtension.contains(extension1)){
                        fs.renameSync(files.img1.path,  site.goodsFilePath + "//" + img1Name);
                    }else{
                        req.flash('error', '上传的大图片格式只能是JPG,GIF,PNG中的一种');
                        res.redirect('/cpanel/goods/1');
                        return;
                    }



                    var goodsArr = {
                        name: fields.name,
                        description: fields.description,
                        salesInfo : fields.salesInfo,
                        tips : fields.tips,
                        img : imgName,
                        img1 : img1Name,
                        mid : 1,
                        gid : this.gid,
                        createTime : new Date(),
                        modifyTime : null,
                        status : Goods.makeStatus().normal
                    };

                    var goods = new Goods(goodsArr);
                    goods.save(function(err, doc){
                        if(err){
                            req.flash('error', '保存数据发生错误');
                            res.redirect('/cpanel/goods/1');
                            return;
                        }

                        req.flash('success', 'Successful!');
                        res.redirect('/cpanel/goods/1');//发表成功
                    });
                }

            });


        });


    });


    app.get('/cpanel/goods-edit/:gid', preCheckLogin);
    app.get('/cpanel/goods-edit/:gid', function(req, res){
        var gid = parseInt(req.params.gid);
        Goods.getByGid(gid, function(err, goods){
            if(err){
                req.flash('error', err);
                window.history.back();
                return
            }
            res.render('cpanel/goods-edit', {
                title: site.title,
                site: site,
                user: req.session.user,
                goods: goods,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });

        })
    });

    app.post('/cpanel/goods-edit/:gid', preCheckLogin);
    app.post('/cpanel/goods-edit/:gid', function(req, res){
        var gid = parseInt(req.params.gid)
        var form = new formidable.IncomingForm();
        form.uploadDir = site.tmpPath;
        form.parse(req, function(err, fields, files) {
            if(!fields.name.trim()){
                req.flash('error', '请填写商品名称');
                res.redirect('/cpanel/goods-edit/'+gid);
                return;
            }
            if(!fields.description.trim()){
                req.flash('error', '请填写商品描述信息');
                res.redirect('/cpanel/goods-edit/'+gid);
                return;
            }

//            if(!files || !files.img || !files.img1 || !files.img.name || !files.img1.name){
//                req.flash('error', '请上传商品图片');
//                res.redirect('/cpanel/goods/1');
//                return;
//            }
            var changeImg = false;
            var changeImg1 = false;
            if(files && files.img && files.img.size > 1024*40){
                req.flash('error', '商品小图大小不能超过40K');
                res.redirect('/cpanel/goods-edit/'+gid);
                return;
            }

            if(files && files.img.name){
                changeImg = true;
            }

            if(files && files.img1 && files.img1.size > 1024*400){
                req.flash('error', '商品大图大小不能超过400K');
                res.redirect('/cpanel/goods-edit/'+gid);
                return;
            }

            if(files && files.img1.name){
                changeImg1 = true;
            }



            Goods.countToday(function (err, num) {
                if (err) {
                    req.flash('error', '获取商品图片名称时发生错误');
                    res.redirect('/cpanel/goods-edit/'+gid);
                }
                else {
                    Goods.getByGid(gid, function(err, goods){
                        var imgName = '';
                        var img1Name = '';
                        if(changeImg || changeImg1){
                            var dateNum = (new Date()).format("yyyyMMddhhmmss");
                            var d = dateNum + num;
                            if(changeImg){
//                                var extension = path.extname(path.basename(files.img.path));
                                var extension = files.img.name.substr(files.img.name.indexOf('.'),files.img.name.length);
                                if(site.imgExtension.contains(extension)){
                                    imgName = d + extension;

                                    fs.renameSync(files.img.path, site.goodsFilePath + "//" + imgName);
                                    var oldPath = site.goodsFilePath + "//" + goods.img;
                                    if(fs.existsSync(oldPath)){
                                        fs.unlinkSync(oldPath);
                                    }
                                }else{
                                    req.flash('error', '上传的小图片格式只能是JPG,GIF,PNG中的一种');
                                    res.redirect('/cpanel/goods-edit/'+gid);
                                    return;
                                }


                            }
                            if(changeImg1){
//                                var extension = path.extname(path.basename(files.img1.path));
                                var extension = files.img.name.substr(files.img1.name.indexOf('.'),files.img1.name.length);
                                if(site.imgExtension.contains(extension)){
                                    img1Name = d + "a" + extension;
                                    fs.renameSync(files.img1.path,  site.goodsFilePath + "//" + img1Name);
                                    var oldPath = site.goodsFilePath + "//" + goods.img1;
                                    if(fs.existsSync(oldPath)){
                                        fs.unlinkSync(oldPath);
                                    }
                                }else{
                                    req.flash('error', '上传的大图片格式只能是JPG,GIF,PNG中的一种');
                                    res.redirect('/cpanel/goods-edit/'+gid);
                                    return;
                                }

                            }
                        }

                        if(!imgName){
                            imgName = goods.img;
                        }

                        if(!img1Name){
                            img1Name = goods.img1;
                        }
                        var goodsArr = {
                            name: fields.name,
                            description: fields.description,
                            salesInfo : fields.salesInfo,
                            tips : fields.tips,
                            img : imgName,
                            img1 : img1Name,
                            mid : 1,
                            gid : goods.gid,
                            createTime : goods.createTime,
                            modifyTime : new Date(),
                            status : goods.status
                        };

                        var goods = new Goods(goodsArr);
                        goods.update(function(err, doc){
                            if(err){
                                req.flash('error', '保存数据发生错误');
                                res.redirect('/cpanel/goods-edit/'+gid);
                                return;
                            }

                            req.flash('success', '修改成功!');
                            res.redirect('/cpanel/goods-edit/'+gid);//发表成功
                        });
                    })





                }

            });

        });

    });

    Date.prototype.format = function (format) {
        var o = {
            "M+": this.getMonth() + 1,
// month
            "d+": this.getDate(),
// day
            "h+": this.getHours(),
// hour
            "m+": this.getMinutes(),
// minute
            "s+": this.getSeconds(),
// second
            "q+": Math.floor((this.getMonth() + 3) / 3),
// quarter
            "S": this.getMilliseconds()
// millisecond
        };
        if (/(y+)/.test(format) || /(Y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    };


    function preCheckLogin(req, res, next){
        if(!req.session.user){
            req.flash('error', "Pls Log in First!");
            return res.redirect('/cpanel');
        }
        next();
    }

    Array.prototype.contains = function (element) { //利用Array的原型prototype点出一个我想要封装的方法名contains
        for (var i = 0; i < this.length; i++) {
            if (this[i] == element) { //如果数组中某个元素和你想要测试的元素对象element相等，则证明数组中包含这个元素，返回true
                return true;
            }
        }
        return false;
    }

}


