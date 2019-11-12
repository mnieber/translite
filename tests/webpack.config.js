var path = require('path');
var webpack = require('webpack');


const test = {
  entry: './tests/tests.js',

  target: 'node',
  mode: 'development',

  output: {
      path: path.resolve('.'),
      filename: "tests/test-bundle.js",
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      }
    }),
  ]
};

module.exports = test;
