/**
 * Created with JetBrains WebStorm.
 * User: wilson
 * Date: 14-4-15
 * Time: 上午10:38
 * To change this template use File | Settings | File Templates.
 */

var mongo = require('./db');

function Goods(goods){
   this.name = goods.name;
   this.description = goods.description;
   this.img = goods.img;
   this.img1 = goods.img1;
   this.mid = goods.mid;
   this.gid = goods.gid;
   this.createTime = goods.createTime;
   this.modifyTime = goods.modifyTime;
   this.status = goods.status;
}

var allGoods = [
    {id:1,name:'冰凉滋润',
    description:'本品采用天然草本秘方与天然薄荷为原料，有效滋润咽喉、亮嗓清嗓，且润肺生津、清热降火。每天一瓶，润喉润声，让您时刻“中国好声音”！',
    img:'img_2831.jpg',img1:'img_2831a.jpg'},
    {id:2,name:'红枣枸杞汁',
    description:'中国古语有云 :一日三枣-容颜不老,本产品含约24克红枣 ,枣味浓郁 , 口感香醇 ,本品系天然美肤的养生佳品 有助于气血调和。滋补、养颜。',
        img:'img_2832.jpg',img1:'img_2832a.jpg'},
    {id:3,name:'花旗参原味',
    description:'颜之堂花旗参原味饮料口感甘甜清爽，是一种补而不燥的高级佳品，产品富含40多种人参皂甙、17中氨基酸，包括精氨酸、萘胺酸等8中人体必需的氨基酸，能有效的提高体力和脑力，具有抗疲劳的作用，常饮精力充沛！',
        img:'img_2833.jpg',img1:'img_2833a.jpg'},
    {id:4,name:'珍珠蜜',
    description:'颜之堂珍珠蜜原味饮料口感甘甜清爽，增强人体抵抗力，产品富含15种氨基酸、30多种微量元素、富含的B族维生素和生物钙质，很好的解决了以往珍珠中的有效成分难以被人体吸收的难题，完整保留珍珠的天然成分。让您轻松保持美丽、娇嫩的肌肤！',
        img:'img_2834.jpg',img1:'img_2834a.jpg'},
    {id:5,name:'塑身一宝',
    description:'本品富含陈香佛手（台湾一宝“老香黄”）萃取精华、易吸收，有清淡柠檬香味、略咸。常饮有助于改善体内环境，美体塑身。',
        img:'img_2835.jpg',img1:'img_2835a.jpg'},
    {id:6,name:'灵芝原味',
    description:'颜之堂灵芝原味饮料口感甘甜清爽是一种补而不燥的高级佳品。产品富含灵芝多糖、多肽类及12种氨基酸，包括精氨酸等人体必需的氨基酸，常饮养颜护肤增强人体体质经常饮用能达到调节身体机能。',
        img:'img_2836.jpg',img1:'img_2836a.jpg'}
    ];

module.exports = Goods;

Goods.makeStatus = function(){
    var s = {normal:1,stop:2};
    return s;
}

Goods.prototype.save = function(callback){
    var goods = {
        name : this.name,
        description : this.description,
        img : this.img,
        img1 : this.img1,
        mid : this.mid,
        gid : this.gid,
        createTime : this.createTime,
        modifyTime : this.modifyTime,
        status : this.status
    };

    mongo(function (err, db){
        if(err){
            return callback(err);  //err
        }

        db.collection('goods', function (err, collection){
            if(err){
                db.close();
                return callback(err);
            }
            collection.find({}, {sort: {gid: -1}, limit:1}).toArray(function(err, last){
                goods.gid = last[0] ? parseInt(last[0].gid) + 1 : 1;
                collection.insert(goods, {safe: true}, function (err, doc){
                    db.close();
                    if(err) return callback(err);
                    callback(null, doc);
                });
            });
        });
    });
}

/**
 * [update 更新商品]
 * @param  {Function} callback [回调函数]
 */
Goods.prototype.update = function (callback) {
    var goods = {
        name : this.name,
        description : this.description,
        img : this.img,
        img1 : this.img1,
        mid : this.mid,
        gid : this.gid,
        createTime : this.createTime,
        modifyTime : this.modifyTime,
        status : this.status
    };
    mongo(function (err, db) {
        if(err){
            db.close();
            return callback(err);
        }
        db.collection('goods', function (err, collection) {
            if(err){
                db.close();
                return callback(err);
            }
            collection.update({'gid': goods.gid}, {$set: goods}, function (err, goods) {
                db.close();
                if(err) return callback(err);
                callback(null, goods);
            });
        });
    });
};


/**
 * [find 从skip开始获取最多amount数量的商品,gid倒序]
 * @param skip
 * @param amount
 * @param status
 * @param callback
 */
Goods.find = function(skip, amount, status, callback){
    //callback(allGoods);
    mongo(function(err, db){
        if (err){
            db.close();
            return callback(err);
        }

        db.collection('goods', function (err, collection) {
            if(err){
                db.close();
                return callback(err);
            }
            collection.count({},function(err, total){
                if(err){
                    db.close();
                    return callback(err);
                }
                if(skip<=total){
                    var result;
                    if(status){
                        result = collection.find({'status':status}, {
                            skip: skip,
                            limit: amount
                        });
                    }else{
                        result = collection.find({}, {
                            skip: skip,
                            limit: amount
                        });
                    }
                    result.sort({gid: -1}).toArray(function (err, goods) {
                            db.close();
                            if (err) return callback(err);
                            callback(null, goods, total);
                        });
                }else{
                    callback(null, null, total);
                }


            });

        });
    });
};

/**
 * [getByGid 获取一个商品]
 * @param  {[type]}   gid      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Goods.getByGid = function(gid,callback){
    mongo(function (err, db){
        if(err){
            db.close();
            return callback(err);
        }
        db.collection('goods', function (err, collection){
            if (err){
                db.close();
                return callback(err);
            }
            collection.findOne({'gid': gid}, function (err, doc){
                if(err){
                    db.close();
                    return callback(err);
                }
                db.close();
                callback(null, doc);
            });
        });
    });
};


Goods.countToday = function (callback){
    mongo(function(err, db){
        if (err) return callback(err);

        db.collection('goods', function (err, collection) {
            if(err){
                db.close();
                return callback(err);
            }
            var today = new Date();
            var start = new Date(today.getFullYear(),today.getMonth(),today.getDate(),0,0,0);
            var end = new Date(today.getFullYear(),today.getMonth(),today.getDate(),23,59,59);
            collection.count({'createTime': {"$gte": start,"$lt": end}},function (err, num) {
                db.close();
                if(err) return callback(err);
                callback(null, num);
            });
        });
    });
};

Goods.count = function (callback){
    mongo(function(err, db){
        if (err) return callback(err);

        db.collection('goods', function (err, collection) {
            if(err){
                db.close();
                return callback(err);
            }
            collection.count(function (err, num) {
                db.close();
                if(err) return callback(err);
                callback(null, num);
            });
        });
    });
};
