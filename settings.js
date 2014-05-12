/**
 * mongoDb配置
 * 如果开启了mongodb的auth,请更改user和password字段
 * if you enable mongodb auth, pls change user & password field
 */
var path = require('path');

var mongo = { 
  cookieSecret: 'wj0608',
  db: 'wj-biz',
  host: '127.0.0.1',
  port: '27017',
  user: null,
  password: null
}; 

/**
 * 站点配置
 */
var site = {
	author: "Wilson",
	title: "伟骏",
	subtitle: "@Wilson",
    tmpPath: path.join(__dirname, 'tmp'),
	indexMerchantAmount: 5, //显示的Merchant每页数量,etc,0 == all
    indexGoodsAmout:2,    //显示的Goods每页数量,etc,0 == all
    goodsFilePath: path.join(__dirname, 'public/images/goods'), //规定goods图片路径
    imgExtension : ['.jpg','.JPG','.GIF','.gif','.png','.PNG']  //限定goods图片格式

};


module.exports = {
	mongo: mongo,
	site: site
}