/* eslint-disable */
const fs = require('fs');
const path = require('path')
const webpack = require('webpack')
const pkg = require('../package.json');

const babelExclude = /node_modules/
const outputPath = path.join(__dirname, '..');

const config = {
  entry: {
    main: path.join(__dirname, '../src', 'index.js'),
  },
  output: {
    path: outputPath,
    filename: '[name].js',
    libraryTarget: 'commonjs',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: babelExclude,
      },
      {
        test: /\.scss$/,
        use: [{
          loader: 'css-loader',
          options: {
            localIdentName: '[path]__[name]__[local]__[hash:base64:5]',
            modules: true,
            camelCase: true,
          }
        }, {
          loader: 'sass-loader',
        }]
      },
      {
        test: /\.css$/,
        use: [{
          loader: 'css-loader',
          options: {
            localIdentName: '[path]__[name]__[local]__[hash:base64:5]',
            modules: true,
            camelCase: true,
          }
        }]
      },
    ],
  },
  // node: {
  //   dgram: 'empty',
  //   fs: 'empty',
  //   net: 'empty',
  //   tls: 'empty',
  //   child_process: 'empty',
  //   rc: 'empty',
  // },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  externals: {
    react: 'react',
    mongodb: 'mongodb',
    shortid: 'shortid'
  },
  plugins: [
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: ['vendor', 'manifest'],
    // }),
  ]
};

// PROD ONLY
if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin(),
  );
}
module.exports = config
