/**
 * Created by liaozhisong on 9/14/14.
 */
var config = require('../config.json');
var mongoose = require('mongoose');
var options = {
    user: config.db.user,
    pass: config.db.pass,
    server: {
        socketOptions:{
            keepAlive: 1
        }
    }
};
var connectWithRetry = function () {
    try{
        mongoose.connect(config.db.host, options, function (err) {
            if (err) {
                console.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
                setTimeout(connectWithRetry, 5000);
            }
        });
    } catch(e) {
        console.error('-------------------',e);
    }
};

module.exports = connectWithRetry;
