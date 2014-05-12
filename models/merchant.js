var mongo = require('./db');

function Merchant(merchant) {
    this.name = merchant.name;
    this.username = merchant.username;
    this.password = merchant.password;
    this.email = merchant.email,
    this.phone = merchant.phone,
    this.mobile = merchant.mobile,
    this.fax = merchant.fax,
    this.address = merchant.address,
    this.createTime = merchant.createTime,
    this.modifyTime = merchant.modifyTime,
    this.permission = merchant.permission,
    this.salesInfo = merchant.salesInfo,
    this.mid = merchant.mid
};

module.exports = Merchant;

Merchant.makePermission = function(){
    var p = {normal:1,stop:2};
    return p;
}

Merchant.prototype.save = function(callback){
    var merchant = {
        name: this.name,
        username:this.username,
        password: this.password,
        email: this.email,
        phone: this.phone,
        mobile: this.mobile,
        fax:this.fax,
        address: this.address,
        createTime : this.createTime,
        modifyTime:this.modifyTime,
        permission:this.permission,
        salesInfo:this.salesInfo,
        mid:this.mid
    };
    mongo(function (err, db){
        if(err){
            return callback(err);  //err
        }

        db.collection('merchants', function (err, collection){
            if(err){
                db.close();
                return callback(err);
            }
            collection.find({}, {sort: {mid: -1}, limit:1}).toArray(function(err, last){
                merchant.mid = last[0] ? parseInt(last[0].mid) + 1 : 1;
                collection.insert(merchant, {safe: true}, function (err, doc){
                    db.close();
                    if(err) return callback(err);
                    callback(null, doc);
                });
            });
        });
    });
};

/**
 * [update 更新商户]
 * @param  {Function} callback [回调函数]
 */
Merchant.prototype.update = function (callback) {
    var merchant = {
        name: this.name,
        username:this.username,
        password: this.password,
        email: this.email,
        phone: this.phone,
        mobile: this.mobile,
        fax:this.fax,
        address: this.address,
        createTime : this.createTime,
        modifyTime:this.modifyTime,
        permission:this.permission,
        salesInfo:this.salesInfo,
        mid:this.mid
    };
    mongo(function (err, db) {
        if(err){
            db.close();
            return callback(err);
        }
        db.collection('merchants', function (err, collection) {
            if(err){
                db.close();
                return callback(err);
            }
            collection.update({'mid': merchant.mid}, {$set: merchant}, function (err, merchant) {
                db.close();
                if(err) return callback(err);
                callback(null, merchant);
            });
        });
    });
};

Merchant.getByName = function (name, callback){
    mongo(function(err, db){
        if (err) return callback(err);

        db.collection('merchants', function (err, collection) {
            if(err){
                db.close();
                return callback(err);
            }
            collection.findOne({'name': name}, function (err, merchant) {
                db.close();
                if(err) return callback(err);
                callback(null, merchant);
            });
        });
    });
};

Merchant.getByUsername = function (username, callback){
    mongo(function(err, db){
        if (err) return callback(err);

        db.collection('merchants', function (err, collection) {
            if(err){
                db.close();
                return callback(err);
            }
            collection.findOne({'username': username}, function (err, merchant) {
                db.close();
                if(err) return callback(err);
                callback(null, merchant);
            });
        });
    });
};

/**
 * [getOne 显示一篇文章用的 pv++噢]
 * @param  {[type]}   mid      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Merchant.getByMid = function(mid, callback){
    mongo(function (err, db){
        if(err){
            db.close();
            return callback(err);
        }
        db.collection('merchants', function (err, collection){
            if (err){
                db.close();
                return callback(err);
            }
            collection.findOne({'mid': mid}, function (err, doc){
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

/**
 * [find 从skip开始获取最多amount数量的商户,pid倒序]
 * @param skip
 * @param amount
 * @param callback
 */
Merchant.find = function (skip, amount, callback){
    mongo(function(err, db){
        if (err){
            db.close();
            return callback(err);
        }

        db.collection('merchants', function (err, collection) {
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
                    collection.find({}, {
                        skip: skip,
                        limit: amount
                    }).sort({pid: -1}).toArray(function (err, merchants) {
                            db.close();
                            if (err) return callback(err);
                            callback(null, merchants, total);
                        });
                }else{
                    callback(null, null, total);
                }


            });

        });
    });
};

/**
 * [find 从skip开始获取最多amount数量的商户,pid倒序]
 * @param skip
 * @param amount
 * @param callback
 */
Merchant.findByPermission = function (skip, amount, permission, callback){
    mongo(function(err, db){
        if (err){
            db.close();
            return callback(err);
        }

        db.collection('merchants', function (err, collection) {
            if(err){
                db.close();
                return callback(err);
            }
            collection.count({'permission':permission},function(err, total){
                if(err){
                    db.close();
                    return callback(err);
                }
                if(skip<=total){
                    collection.find({'permission':permission}, {
                        skip: skip,
                        limit: amount
                    }).sort({pid: -1}).toArray(function (err, merchants) {
                            db.close();
                            if (err) return callback(err);
                            callback(null, merchants, total);
                        });
                }else{
                    callback(null, null, total);
                }


            });

        });
    });
};

Merchant.count = function (callback){
    mongo(function(err, db){
        if (err) return callback(err);

        db.collection('merchants', function (err, collection) {
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






