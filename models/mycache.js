var cache ;
if(!cache){
  cache = require("node-smple-cache").createCache("LRU", 100 * 100 * 10);
}

module.exports = cache;