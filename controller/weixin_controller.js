/**
 * Created by liaozhisong on 9/23/14.
 */


var express = require('express');
var router = express.Router();
var logger = require('../component/logger')('weixin_controller');
var Weixin = require('../model/weixin');

//微信认证接口
router.get('/api', function (req, res) {
    var newWeixin = new Weixin({
        signature: req.query.signature,
        timestamp: req.query.timestamp,
        nonce: req.query.nonce,
        echostr: req.query.echostr
    });
    newWeixin.auth(function (err, data) {
        if (err) {
            logger.error(err);
            res.send("auth error!");
            return;
        }
        res.send(data);
    });
});

//微信调用接口
router.post('/api',function (req, res) {
    logger.info('weixin message received!!');
    var message = '';
    req.setEncoding('utf8');
    req.on('data',function (chunk) {
        message += chunk;
    }).on('end', function () {
        var newWeixin = new Weixin({message: message});
        newWeixin.handle(function (err, data) {
            if(err){
                logger.error(err);
                return res.end('error!');
            }
            logger.info(data);
            res.end(data);
        });
    });
});

module.exports = router;
