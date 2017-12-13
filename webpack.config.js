const path = require('path');

module.exports = {
  entry: './app/src/index.js',
  output: {
    path: path.resolve(__dirname, './static/'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.yaml$/,
        loader: 'yaml'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  }
};
