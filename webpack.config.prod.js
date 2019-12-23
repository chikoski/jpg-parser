const conf = require('./webpack.config.js');

conf.output.filename = '[name].min.js';
conf.mode = 'production';

module.exports = conf;