var mongo = require('./db');

function Siteinfo(siteinfo) {
    this.name = siteinfo.name;
    this.title = siteinfo.title;
    this.keywords = siteinfo.keywords;
    this.description = siteinfo.description;
    this.url = siteinfo.url,
    this.template = siteinfo.template,
    this.sid = siteinfo.sid,
    this.mid = siteinfo.mid
};

module.exports = Siteinfo;

Siteinfo.prototype.save = function(callback){
    var siteinfo = {
        name: this.name,
        title: this.title,
        keywords: this.keywords,
        description: this.description,
        url: this.url,
        template: this.template,
        sid:this.sid,
        mid:this.mid
    };
    mongo(function (err, db){
        if(err){
            return callback(err);  //err
        }

        db.collection('siteinfo', function (err, collection){
            if(err){
                db.close();
                return callback(err);
            }
            collection.find({}, {sort: {sid: -1}, limit:1}).toArray(function(err, last){
                siteinfo.sid = last[0] ? parseInt(last[0].sid) + 1 : 1;
                collection.insert(siteinfo, {safe: true}, function (err, doc){
                    db.close();
                    if(err){
                        return callback(err);
                    }
                    callback(null, doc);//成功！err 为 null
                });

            });

        });
    });
};

/**
 * [update 更新商户]
 * @param  {Function} callback [回调函数]
 */
Siteinfo.prototype.update = function (callback) {
    var siteinfo = {
        name: this.name,
        title: this.title,
        keywords: this.keywords,
        description: this.description,
        url: this.url,
        template: this.template,
        sid:this.sid,
        mid:this.mid
    };

    mongo(function (err, db) {
        if(err){
            db.close();
            return callback(err);
        }
        db.collection('siteinfo', function (err, collection) {
            if(err){
                db.close();
                return callback(err);
            }
            collection.update({'sid': siteinfo.sid}, {$set: siteinfo}, function (err, siteinfo) {
                db.close();
                if(err) return callback(err);
                callback(null, siteinfo);
            });
        });
    });
};

Siteinfo.getByName = function (name, callback){
    mongo(function(err, db){
        if (err) return callback(err);

        db.collection('siteinfo', function (err, collection) {
            if(err){
                db.close();
                return callback(err);
            }
            collection.findOne({'name': name}, function (err, siteinfo) {
                db.close();
                if(err) return callback(err);
                callback(null, siteinfo);
            });
        });
    });
};

Siteinfo.getBySid = function (sid, callback){
    mongo(function(err, db){
        if (err) return callback(err);

        db.collection('siteinfo', function (err, collection) {
            if(err){
                db.close();
                return callback(err);
            }
            collection.findOne({'sid': sid}, function (err, siteinfo) {
                db.close();
                if(err) return callback(err);
                callback(null, siteinfo);
            });
        });
    });
};

Siteinfo.getByMid = function (mid, callback){
    mongo(function(err, db){
        if (err) return callback(err);

        db.collection('siteinfo', function (err, collection) {
            if(err){
                db.close();
                return callback(err);
            }
            collection.findOne({'mid': mid}, function (err, siteinfo) {
                db.close();
                if(err) return callback(err);
                callback(null, siteinfo);
            });
        });
    });
};

Siteinfo.getByUrl = function (url, callback){
    mongo(function(err, db){
        if (err) return callback(err);

        db.collection('siteinfo', function (err, collection) {
            if(err){
                db.close();
                return callback(err);
            }
            collection.findOne({'url': url}, function (err, siteinfo) {
                db.close();
                if(err) return callback(err);
                callback(null, siteinfo);
            });
        });
    });
};

Siteinfo.count = function (callback){
    mongo(function(err, db){
        if (err) return callback(err);

        db.collection('siteinfo', function (err, collection) {
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






