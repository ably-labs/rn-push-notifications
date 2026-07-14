# rn-push-example

Bare React Native (0.86) test app for the new **`ably/react-native-push`** plugin, installed from the local tarball `ably-2.24.0.tgz`.

The app can activate the device for push, show its `deviceId`, and subscribe/unsubscribe the device to an Ably channel. Push transport is **FCM on Android** and **raw APNs on iOS** (both `transportType` values of the plugin), with the token fetched via `@react-native-firebase/messaging`.

## Setup

1. **Ably key** — copy `.env.example` to `.env` and set `ABLY_API_KEY` (needs push capabilities). Restart Metro with `--reset-cache` after changing it (react-native-dotenv inlines it at transform time).
2. **Android / FCM** — drop your Firebase `google-services.json` into `android/app/`. (The google-services gradle plugin is applied only when the file exists, so the app builds without it — but FCM won't work until it's there.)
3. **iOS / APNs** — add `GoogleService-Info.plist` to `ios/RNPushExample/` via Xcode (needed by react-native-firebase even though the raw APNs token is used), and set your signing team. The `aps-environment` entitlement and `remote-notification` background mode are already configured. Real pushes require a physical device.
4. Make sure the Ably app has FCM/APNs credentials configured in the dashboard (Notifications tab).

## Run

```sh
npm run android   # emulator must have Play Services
npm run ios       # physical device for actual pushes
```

## Iterating on the ably tarball

npm caches tarballs per version. After rebuilding `ably-2.24.0.tgz` with the same version number:

```sh
npm install ./ably-2.24.0.tgz --force
npx react-native start --reset-cache
```

## Where things live

- `push.ts` — `ReactNativePush.create({ storage, requestToken })` + `Realtime` client (module scope)
- `App.tsx` — activate/deactivate, deviceId display, channel subscribe/unsubscribe, foreground push alerts
- `index.js` — `setBackgroundMessageHandler` (must be outside React)

## Verifying registrations

```sh
ably push device list
ably push channel-subscriptions list --channel push:test
ably channels publish push:test --push '{"notification": {"title": "Hi", "body": "Test"}}'
```
