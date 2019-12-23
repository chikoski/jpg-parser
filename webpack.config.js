const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    'lib': './src/lib/index.ts',
  },
  output: {path: path.resolve(__dirname, './dist'), filename: '[name].js'},
  module: {rules: [{test: /\.ts$/, use: 'ts-loader'}]},
  resolve: {extensions: ['.ts', '.js']}
};