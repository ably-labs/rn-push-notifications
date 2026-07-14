/**
 * Test app for the ably/react-native-push plugin.
 *
 * @format
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { onMessage, requestPermission } from '@react-native-firebase/messaging';
import { client, messaging } from './push';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

async function requestNotificationPermission(): Promise<void> {
  if (Platform.OS === 'ios') {
    await requestPermission(messaging);
  } else if (Platform.OS === 'android' && Platform.Version >= 33) {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  }
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [activated, setActivated] = useState(false);
  const [channelName, setChannelName] = useState('push:test');
  const [status, setStatus] = useState('idle');
  const [busy, setBusy] = useState(false);

  const refreshDevice = useCallback(async () => {
    const device = await client.getDevice();
    setDeviceId(device.id ?? null);
    setActivated(!!device.deviceIdentityToken);
  }, []);

  useEffect(() => {
    refreshDevice().catch(err =>
      setStatus(`getDevice failed: ${err.message ?? err}`),
    );

    // Show pushes received while the app is foregrounded.
    return onMessage(messaging, message => {
      Alert.alert(
        message.notification?.title ?? 'Push received (foreground)',
        message.notification?.body ?? JSON.stringify(message.data),
      );
    });
  }, [refreshDevice]);

  const run = useCallback(
    (label: string, op: () => Promise<void>) => async () => {
      setBusy(true);
      setStatus(`${label}…`);
      try {
        await op();
        setStatus(`${label}: OK`);
      } catch (err: any) {
        setStatus(`${label} failed: ${err?.message ?? String(err)}`);
        console.error(label, err);
      } finally {
        await refreshDevice().catch(() => {});
        setBusy(false);
      }
    },
    [refreshDevice],
  );

  const activate = run('activate', async () => {
    await requestNotificationPermission();
    await client.push.activate();
  });

  const deactivate = run('deactivate', () => client.push.deactivate());

  const subscribe = run(`subscribe ${channelName}`, () =>
    client.channels.get(channelName).push.subscribeDevice(),
  );

  const unsubscribe = run(`unsubscribe ${channelName}`, () =>
    client.channels.get(channelName).push.unsubscribeDevice(),
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: safeAreaInsets.top + 16 },
      ]}
    >
      <Text style={styles.title}>Ably RN Push</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Device ID</Text>
        <Text style={styles.value} selectable>
          {deviceId ?? '(not activated)'}
        </Text>
        <Text style={styles.label}>Activated</Text>
        <Text style={styles.value}>{activated ? 'yes' : 'no'}</Text>
      </View>

      <View style={styles.row}>
        <Button title="Activate" onPress={activate} disabled={busy} />
        <Button title="Deactivate" onPress={deactivate} disabled={busy} />
      </View>

      <Text style={styles.label}>Channel</Text>
      <TextInput
        style={styles.input}
        value={channelName}
        onChangeText={setChannelName}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.row}>
        <Button
          title="Subscribe device"
          onPress={subscribe}
          disabled={busy || !channelName}
        />
        <Button
          title="Unsubscribe"
          onPress={unsubscribe}
          disabled={busy || !channelName}
        />
      </View>

      <Text style={styles.label}>Status</Text>
      <Text style={styles.status} selectable>
        {status}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  card: {
    padding: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#888',
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.6,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  value: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  status: {
    fontSize: 14,
  },
});

export default App;
