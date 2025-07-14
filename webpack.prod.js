// webpack.prod.js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = merge(common, {
  mode: 'production',  // Set mode ke production

  optimization: {
    minimize: true,  // Mengaktifkan minifikasi untuk JS dan CSS
    minimizer: [
      new TerserPlugin(),  // Untuk minifikasi JS
      new CssMinimizerPlugin(),  // Untuk minifikasi CSS
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/templates/index.html',
      minify: {
        collapseWhitespace: true,  // Menghapus spasi berlebih
        removeComments: true,  // Menghapus komentar
      },
    }),
  ],
});
