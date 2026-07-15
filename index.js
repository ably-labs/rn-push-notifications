/**
 * @format
 */

// Polyfill crypto.getRandomValues before anything imports ably — the
// react-native-push plugin's ulid dependency needs it to generate device IDs.
import 'react-native-get-random-values';
import { AppRegistry } from 'react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Must be registered outside of any component; runs for data messages
// received while the app is backgrounded or quit.
setBackgroundMessageHandler(getMessaging(), async message => {
  console.log('Push received in background:', JSON.stringify(message));
});

AppRegistry.registerComponent(appName, () => App);
