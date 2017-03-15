var path = require('path');
var webpack = require("webpack");

module.exports = {
  entry: './lib/chart/index.js',
  output: {
    filename: 'dist.js',
    path: path.resolve(__dirname, 'lib/dist'),
  },
  devtool: "cheap-eval-source-map",
  
};