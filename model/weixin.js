/**
 * Created with IntelliJ IDEA.
 * User: liaozhisong
 * Date: 13-10-29
 * Time: 下午12:50
 * To change this template use File | Settings | File Templates.
 */

var httpUtil = require('../component/http_util');
var cipher = require('../component/encipher');
var logger = require('../component/logger')('weixin');
var config = require('../config.json');
var xml2js = require('xml2js');
var builder = require('xmlbuilder');
var Food = require('../model/food');
var Word = require('../model/word');

function Weixin(weixin) {
    this.signature = weixin.signature;
    this.timestamp = weixin.timestamp;
    this.nonce = weixin.nonce;
    this.echostr = weixin.echostr;
    this.message = weixin.message;
}

module.exports = Weixin;

Weixin.prototype.auth = function (callback) {
    logger.info(JSON.stringify(this));
    var token = config.token;
    var srcArray = [token, this.timestamp, this.nonce];
    var src = srcArray.sort().join('');
    var signature = cipher.sha1(src);
    if (this.signature == signature) {
        return callback(null, this.echostr);
    } else {
        return callback('signature not equals passed:' + this.signature + ' calculate result:' + signature);
    }
};

Weixin.prototype.handle = function (callback) {
    try {
        xml2js.parseString(this.message, function (err, reqMessage) {
            if (err) {
                logger.error('xml parse error!');
                return callback(err);
            }
            logger.info(JSON.stringify(reqMessage));
            var msgType = reqMessage.xml.MsgType[0];
            if (msgType == 'text') {
                textMessageHandler(reqMessage, function (err, respMessage) {
                    return callback(null, respMessage);
                });
            } else if (msgType == 'event') { //事件推送
                var event = reqMessage.xml.Event[0];
                if (event === 'subscribe') {
                    subscribeMessage(reqMessage, function (err, respMessage) {
                        return callback(err, respMessage);
                    });
                } else if (event === 'unsubscribe') {

                } else if (event === 'VIEW') {
                    return callback(null, defaultMessage());
//                var eventKey = reqMessage.xml.EventKey[0];
//                if(eventKey=='TEACHER_SEARCH') {
//                    responseXml = searchTeacherMessage(reqMessage);
//                } else if(eventKey=='COURSE_SEARCH'){
//                    responseXml = searchCourseMessage(reqMessage);
//                }
                }
            }
        });
    } catch (e) {
        return callback(e);
    }
};

//db.foods.find({"name": /.*萝卜.*/})
var textMessageHandler = function (reqMessage, callback) {
    var name = reqMessage.xml.Content[0];
    if (name) {
        name = trim(name);
    }
    if (name) {
        var regStr = '/.*' + name + '.*/';
        Food.find({name: eval(regStr)}, function (err, foods) {
            if (err) {
                return callback(err);
            }
            if (foods.length == 0) {
                logger.info('no keyword match!');
                defaultMessage(reqMessage, function (err, respMessage) {
                    return callback(null, respMessage);
                });
            } else {
                var food = null;
                for (var i = 0; i < foods.length;i++) {
                    if(name==foods[i].name) {
                        food = foods[i];
                        break;
                    }
                }
                if(food) {
                    var respMessage =  //'特性与功效：' + food.feature +
                        '【孕妇：'+food.pregnant.can+'】' + dealMsgStr(food.pregnant.content) +
                        '\n【产妇：'+food.afterPregnant.can+'】' + dealMsgStr(food.afterPregnant.content) +
                        '\n【婴儿：'+food.babyUsers.can+'】' + dealMsgStr(food.babyUsers.content);
                    return callback(null, buildTextMessage(reqMessage,respMessage));
                } else {
                    var message = '您可以输入以下关键词：';
                    for (var index = 0; index < foods.length;index++) {
                        message += '\n' + foods[index].name;
                    }
                    return callback(null, buildTextMessage(reqMessage, message));
                }
            }
        });
    } else {
        defaultMessage(reqMessage, function (err, respMessage) {
            return callback(null, respMessage);
        });
    }
};

var dealMsgStr = function (str) {
    try {
        return str.substr(str.indexOf('。')+1);
    } catch(e) {
        logger.error(str,e);
        return str;
    }
};

var subscribeMessage = function (reqMessage, callback) {
    return callback(null, buildTextMessage(reqMessage,
        'Hi，我们关注孕妇、产妇及婴儿，详细整理分类哪些食物能吃、适宜吃，哪些食物慎吃、不能吃！是不是很有用，赶紧关注我们吧，让生活越来越健康！'));
};

var defaultMessage = function (reqMessage, callback) {
    return callback(null, buildTextMessage(reqMessage, '未查询到数据，您可以输入其他食品名称查询！'));
};

var buildTextMessage = function (reqMessage, respMessage) {
    return builder.create('xml')
        .ele('ToUserName').cdata(reqMessage.xml.FromUserName[0])
        .up().ele('FromUserName').cdata(reqMessage.xml.ToUserName[0])
        .up().ele('CreateTime').txt(new Date().getTime())
        .up().ele('MsgType').cdata('text')
        .up().ele('Content').cdata(respMessage)
        .end({ pretty: true});
};

Weixin.prototype.getAccessToken = function (callback) {
    var hostname = 'api.weixin.qq.com';
    var path = '/cgi-bin/token';
    var params = {
        'grant_type': 'client_credential',
        appid: config.appId,
        secret: config.appSecret
    };
    httpUtil.getHttpsJSON(hostname, path, params, function (err, obj) {
        if (err)return callback(err);
        var token = obj.access_token;
        if (token) {
            return callback(null, token);
        } else {
            return callback('no attribute access_token in data: ' + JSON.stringify(obj));
        }
    });
};

function trim(str) {
    return str.replace(/(^\s+)|(\s+$)/g, "");
}