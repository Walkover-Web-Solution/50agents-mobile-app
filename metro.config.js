const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    extraNodeModules: {
      // Ensure 'buffer' resolves from the project-level package instead of nested paths
      buffer: require.resolve('buffer/'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
