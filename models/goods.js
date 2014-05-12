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
   this.salesInfo = goods.salesInfo;
   this.tips = goods.tips;
   this.img = goods.img;
   this.img1 = goods.img1;
   this.mid = goods.mid;
   this.gid = goods.gid;
   this.createTime = goods.createTime;
   this.modifyTime = goods.modifyTime;
   this.status = goods.status;
}

module.exports = Goods;

Goods.makeStatus = function(){
    var s = {normal:1,stop:2};
    return s;
}

Goods.prototype.save = function(callback){
    var goods = {
        name : this.name,
        description : this.description,
        salesInfo : this.salesInfo,
        tips : this.tips,
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
        salesInfo : this.salesInfo,
        tips : this.tips,
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
