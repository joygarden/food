/**
 * Created by liaozhisong on 9/11/14.
 */


var httpUtil = require('../component/http_util');
var logger = require('../component/logger')('spider');
var cheerio = require('cheerio');
var Food = require('../model/food');

function Spider() {
}

module.exports = Spider;

Spider.prototype.grab = function () {
    var url = 'http://www.mmbang.com';
    var path = '/app/nbnc/c-1';
    httpUtil.getHttpData(url + path, function (err, data) {
        if (err) {
            logger.error(err);
            return;
        }
        var $ = cheerio.load(data);
        $('#nbnc_cats').find('a').each(function () {
            var category = {
                name: $(this).text(),
                path: $(this).attr('href')
            };
            httpUtil.getHttpData(url + category.path, function (err, data) {
                if (err) {
                    logger.error(err);
                    return;
                }
                $ = cheerio.load(data);
                $('#app_page_body').find('a.blue').each(function () {
                    var food = new Food({
                        name: $(this).text(),
                        path: $(this).attr('href'),
                        categoryName: category.name,
                        categoryPath: category.path
                    });
                    logger.info(food.name);

                    httpUtil.getHttpData(url + food.path, function (err, data) {
                        if (err) {
                            logger.error(err);
                            return;
                        }
                        $ = cheerio.load(data);
                        var appBody = $('#app_page_body'),content;

                        content = appBody.find('a[name="pregnant_uses"]').next();
                        food.feature = content.text();

                        content = appBody.find('a[name="after_pregnant_uses"]').next();
                        food.pregnant = {can: getCan(content), content: content.text()};

                        content = appBody.find('a[name="baby_uses"]').next();
                        food.afterPregnant = {can: getCan(content), content: content.text()};

                        content = appBody.find('a[name="problems"]').next();
                        food.babyUsers = {can: getCan(content), content: content.text()};

                        content = appBody.find('a[name="use_tips"]').next();
                        food.buyTips = content.text();

                        content = appBody.find('a[name="pic"]').next();
                        food.useTips = content.text();

                        food.save(function(err,food){
                            if(err)return logger.error(err);
                            logger.info(food.name+' saved!');
                        });
                    });
                });
            });
        });
    });
};

function getCan (content) {
    return content.hasClass('nbnc_yes') ? '能吃'
        : content.hasClass('nbnc_notice') ? '慎食'
        : content.hasClass('nbnc_no') ? '不能吃' : '';
}