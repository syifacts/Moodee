const path = require('path');

// webpack.dev.js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',  // Set mode ke development

  devtool: 'eval-source-map',  // Untuk debug yang lebih baik

  devServer: {
    static: './dist',
    open: true,
    port: 4043,
  },
  

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/templates/index.html',  // Menambahkan template HTML
    }),
  ],
});
