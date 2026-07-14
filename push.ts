import { Platform } from 'react-native';
import { Realtime } from 'ably';
import ReactNativePush from 'ably/react-native-push';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getMessaging,
  getToken,
  getAPNSToken,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';
import { ABLY_API_KEY } from '@env';

export const messaging = getMessaging();

const Push = ReactNativePush.create({
  storage: AsyncStorage,
  requestToken: async () => {
    if (Platform.OS === 'ios') {
      // Raw APNs transport on iOS. getAPNSToken() returns null until the device
      // is registered with APNs (and always on the simulator).
      await registerDeviceForRemoteMessages(messaging);
      const token = await getAPNSToken(messaging);
      if (!token) {
        throw new Error(
          'No APNs token available (simulator, or not registered for remote messages?)',
        );
      }
      return { transportType: 'apns' as const, token };
    }
    return { transportType: 'fcm' as const, token: await getToken(messaging) };
  },
});

export const client = new Realtime({
  key: ABLY_API_KEY,
  plugins: { Push },
});
