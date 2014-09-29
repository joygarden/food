/**
 * Created by liaozhisong on 9/14/14.
 */

var express = require('express');
var router = express.Router();
var Food = require('../model/food');

/* GET users listing. */
router.get('/', function(req, res) {
    res.send('respond with a resource');
});

router.get('/category/list', function(req, res) {
    Food.distinct("categoryName",function(err,categories){
        res.send({"categories":categories});
    });
});

router.get('/list/:category', function(req, res) {
    var name = req.params.category;
    name = name.replace(new RegExp("-","gm"),"/");
    Food.find({'categoryName':name}, {'name': 1}, function (err, foods) {
        res.send({"foods":foods});
    });
});

router.get('/:name', function(req, res) {
    var name = req.params.name;
    Food.findOne({name: name}, function (err, food) {
        res.send({"food":food});
    });
});

module.exports = router;
