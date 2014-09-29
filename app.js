var express = require('express');

var app = express();

require('./component/express')(app);
require('./component/routes')(app);
require('./component/mongo')();

module.exports = app;
