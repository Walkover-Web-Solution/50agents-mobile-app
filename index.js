/**
 * @format
 */

// Native JSI module + polyfills for crypto-dependent libs
import 'react-native-quick-crypto';
import { Buffer } from 'buffer';
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
