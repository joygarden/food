/**
 * Created by liaozhisong on 9/14/14.
 */
var config = require('../config.json');
var log4js = require('log4js');
log4js.configure(config.log4js);

module.exports = function (name) {
    var logger = log4js.getLogger(name);
    logger.setLevel('INFO');
    return logger;
};