var path = require('path');
var webpack = require('webpack');


const test = {
  entry: './tests.js',

  target: 'node',

  module: {
    loaders: [
      {
        test: /.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['babel-preset-es2015', 'babel-preset-react', 'es2015'],
        }
      }
    ]
  },

  output: {
      path: path.resolve('.'),
      filename: "test-bundle.js",
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
