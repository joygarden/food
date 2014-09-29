/**
 * Created by liaozhisong on 9/23/14.
 */

var crypto = require('crypto');
var logger = require('../component/logger')('encipher');


/**
 * sha1加密
 * @param str
 * @returns {*}
 */
exports.sha1 = function (str) {
    logger.info('before:' + str);
    var md5sum = crypto.createHash('sha1');
    md5sum.update(str, 'utf8');
    str = md5sum.digest('hex');
    logger.info('after:' + str);
    return str;
};
