/**
 * @format
 */

// Native JSI module + polyfills for crypto-dependent libs
// import 'react-native-quick-crypto';
// import { Buffer } from 'buffer';
// if (typeof global.Buffer === 'undefined') {
//   global.Buffer = Buffer;
// }

// Configure Google Sign In early
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
// console.log('🔍 CONFIGURING GOOGLE SIGN IN...');
// GoogleSignin.configure({
//   iosClientId: '1019882119040-0md5li7r6esh7655che4uas5kcmodcng.apps.googleusercontent.com',
//   webClientId: '1019882119040-0md5li7r6esh7655che4uas5kcmodcng.apps.googleusercontent.com',
// });
// console.log('✅ GOOGLE SIGN IN CONFIGURED');

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
