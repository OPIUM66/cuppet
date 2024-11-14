const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  entry: './index.js',
  mode : "production",

  output: {
    filename: 'worker.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.json'],

    fallback: {
      "stream": require.resolve("stream-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "fs": false,
      "os": require.resolve("os-browserify/browser"),
      "buffer": require.resolve("buffer"),
      "net": false,
      "tls": false,
      "crypto": require.resolve("crypto-browserify"),
      "https": require.resolve("https-browserify"),
      "http": require.resolve("stream-http"),
      "url": require.resolve("url/")
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [

    new NodePolyfillPlugin(),
  ],
};
