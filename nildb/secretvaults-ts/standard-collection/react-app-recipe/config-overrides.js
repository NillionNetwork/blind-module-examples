const webpack = require('webpack');

module.exports = function override(config, env) {
  // Suppress source map warnings
  config.ignoreWarnings = [
    { module: /node_modules\/@cosmjs/, message: /Failed to parse source map/ },
    {
      module: /node_modules\/cosmjs-types/,
      message: /Failed to parse source map/,
    },
  ];

  // Browser polyfills
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
    process: require.resolve('process/browser.js'),
    path: require.resolve('path-browserify'),
    os: require.resolve('os-browserify/browser'),
    assert: require.resolve('assert'),
    util: require.resolve('util'),
    url: require.resolve('url'),
    'node:crypto': require.resolve('crypto-browserify'),
    'node:stream': require.resolve('stream-browserify'),
    'node:buffer': require.resolve('buffer'),
    'node:process': require.resolve('process/browser.js'),
    'node:worker_threads': require.resolve('./src/stubs.js'),
    fs: false,
    net: false,
    tls: false,
    child_process: false,
    worker_threads: false,
    'node:fs': false,
    'node:net': false,
    vm: false,
    'pino-pretty': false,
    pino: false,
  };

  // Global provides
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
      const mod = resource.request.replace(/^node:/, '');
      switch (mod) {
        case 'crypto':
          resource.request = 'crypto-browserify';
          break;
        case 'stream':
          resource.request = 'stream-browserify';
          break;
        case 'buffer':
          resource.request = 'buffer';
          break;
        case 'process':
          resource.request = 'process/browser.js';
          break;
        case 'worker_threads':
          resource.request = require.resolve('./src/stubs.js');
          break;
      }
    }),
    new webpack.NormalModuleReplacementPlugin(
      /^pino(-pretty)?$/,
      require.resolve('./src/stubs.js')
    ),
  ];

  return config;
};