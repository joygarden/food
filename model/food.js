/**
 * Created by liaozhisong on 9/11/14.
 */

//function Food(food) {
//    this.id = food.id;
//    this.name = food.name;
//    this.path = food.path;
//    this.categoryName = food.categoryName;
//    this.categoryPath = food.categoryPath;
//}

var mongoose = require('mongoose');

var foodSchema = mongoose.Schema({
    name: String,
    path: String,
    categoryName: String,
    categoryPath: String,
    feature: String,
    buyTips: String,
    useTips: String,
    pregnant: {can:String,content:String},
    afterPregnant: {can:String,content:String},
    babyUsers: {can:String,content:String}
});
foodSchema.index({ name: 1, categoryName: 1 }); // schema level
var Food = mongoose.model('Food', foodSchema);

module.exports = Food;