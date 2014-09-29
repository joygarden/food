/**
 * Created by liaozhisong on 9/15/14.
 */

var http = require('http');
var logger = require('../component/logger')('http');
var queryString = require('querystring');

/**
 * 访问http返回body数据
 * @param url
 * @param callback
 */
exports.getHttpData = function (url, callback) {
    logger.info('request url:' + url);
    http.get(url, function (res) {
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (result) {
            data += result;
        }).on('end', function () {
            try {
                return callback(null, data);
            } catch (e) {
                logger.error("Got error: " + e.message);
                return callback(e.message);
            }
        });
    }).on('error', function (e) {
        logger.error("Got error: " + e.message);
        return callback(e.message);
    });
};

/**
 * 访问rest地址，并返回json对象
 * @param url
 * @param callback
 */
exports.getHttpJSON = function (url, callback) {
    this.getHttpData(url, function (err, data) {
        try {
            var obj = JSON.parse(data);
            return callback(null, obj);
        } catch (e) {
            logger.error("parse json error: " + e.message);
            return callback(e.message);
        }
    });
};

exports.getHttpsData = function (hostname, path, params, callback) {
    if (!isOwnEmpty(params)) {
        var index = path.lastIndexOf('?');
        if (index == -1) {
            path += '?' + queryString.stringify(params);
        } else if (index == path.length - 1) {
            path += queryString.stringify(params);
        } else if (index > 0) {
            path += '&' + queryString.stringify(params);
        }
    }
    var options = {
        hostname: hostname,
        port: 443,
        path: path,
        method: 'GET'
    };
    var request = https.request(options, function (response) {
        logger.info("statusCode: ", response.statusCode);
        var data = '';
        response.on('data', function (d) {
            data += d;
        });
        response.on('end', function () {
            logger.info(data);
            return callback(null, data);
        });
    });
    request.on('error', function (e) {
        logger.error(e);
        return callback(e);
    });
    request.end();
};

exports.getHttpsJSON = function (hostname, path, params, callback) {
    this.getHttpsData(hostname, path, params, function (err, data) {
        if (err) return callback(err);
        try {
            var obj = JSON.parse(data);
            return callback(null, obj);
        } catch (e) {
            logger.error("parse json error: " + e.message);
            return callback(e.message);
        }
    });
};


/**
 * 对象转换为浏览器参数
 * @param url
 * @param obj
 * @returns {*}
 */
exports.obj2Url = function (url, obj) {
    var i = 0;
    for (var key in obj) {
        if (obj[key] && !(obj[key] instanceof Function)) {
            url += i++ === 0 ? '?' : '&';
            url += key + '=' + encodeURI(obj[key]);
        }
    }
    return url;
};

/**
 * 出错重定向
 * @param res
 */
exports.getErrorPath = function (res) {
    return  '/error.html';
};

exports.isOwnEmpty = function (obj) {
    for (var name in obj) {
        if (obj.hasOwnProperty(name)) {
            return false;
        }
    }
    return true;
};
