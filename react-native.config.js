// react-native.config.js
module.exports = {
  assets: ['./node_modules/react-native-vector-icons/Fonts'],
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: null, // Let CocoaPods handle it
      },
    },
  },
};
