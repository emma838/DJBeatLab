// craco.config.js
const webpack = require('webpack');

module.exports = {
  webpack: {
    alias: {
      path: require.resolve('path-browserify'),
      'process/browser': require.resolve('process/browser.js'),
    },
    resolve: {
      fallback: {
        path: require.resolve('path-browserify'),
        fs: false,
        process: require.resolve('process/browser.js'),
      },
    },
    module: {
      rules: [
        {
          test: /fs/,
          use: 'null-loader',
        },
      ],
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser.js',
        Buffer: ['buffer', 'Buffer'],
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^fs$/,
      }),
    ],
  },
  babel: {
    plugins: [
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-optional-chaining',
    ],
  },
};
