/**
 * Created by liaozhisong on 9/27/14.
 */
var mongoose = require('mongoose');

var wordSchema = mongoose.Schema({
    keyword: String,
    content: String,
    type : String
});
wordSchema.index({ name: 1}); // schema level
var Word = mongoose.model('Word', wordSchema);

module.exports = Word;