/**
 * Created by liaozhisong on 9/14/14.
 */

var foodCtrl = require('../controller/food_controller');
var weixinCtrl = require('../controller/weixin_controller');
var log = require('../component/logger')('routes');


module.exports = function (app) {
    //首页跳转
    app.get('/', function (req, res) {
        log.info('visit root,redirect to index.html!');
        res.redirect('/aa.html');
    });

    app.use('/food', foodCtrl);
    app.use('/weixin',weixinCtrl);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });


// error handlers

// development error handler
// will print stacktrace
    if (app.get('env') === 'development') {
        log.info('server start in dev mode!');
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

// production error handler
// no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });


};