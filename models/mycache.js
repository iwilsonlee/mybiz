var cache,cacheControllers ;

cacheControllers = {
    getCache : function(){
        if(!cache){
            cache = require("node-smple-cache").createCache("LRU", 100 * 100 * 10);
        }
        return cache;
    }
}

module.exports = cacheControllers;