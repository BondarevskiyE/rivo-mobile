const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    extraNodeModules: {
      assert: require.resolve('assert'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify'),
      url: require.resolve('url'),
      zlib: require.resolve('browserify-zlib'),
      path: require.resolve('path'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('readable-stream'),
      buffer: require.resolve('buffer'),
    },
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg', 'cjs'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
