# MotoCare Mobile

The MotoCare mobile app is an Expo and React Native client for managing
motorcycles, maintenance, fuel, service history, and vehicle documents.

## Requirements

- Node.js 20 or newer
- npm
- An Android emulator, iOS simulator, or physical device
- A running MotoCare API (see [`../server/README.md`](../server/README.md))
- A Clerk application with a mobile publishable key

For iOS development, use macOS with Xcode installed. Android development
requires Android Studio and an Android SDK.

## Installation

From this directory:

```bash
npm install
```

Create a local `.env` file:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

The API URL must be reachable from the device:

- Android emulator: use `http://10.0.2.2:8000/api` for an API running on the
  host machine.
- iOS simulator: `http://localhost:8000/api` usually works.
- Physical device: use the host computer's LAN IP, for example
  `http://192.168.1.10:8000/api`.

Never commit `.env` or real credentials. Local environment files are ignored by
Git.

## Development

Start the Expo development server:

```bash
npm start
```

Then choose a target from the Expo CLI, or use one of the platform commands:

```bash
npm run android
npm run ios
npm run web
```

The app uses Expo Router. If a native module is added or changed, use a
development build rather than relying on Expo Go:

```bash
npx expo run:android
npx expo run:ios
```

## Quality checks

Run linting and type checking before submitting changes:

```bash
npm run lint
npx tsc --noEmit
```

## Features

- Clerk sign-up, sign-in, and session management
- Motorcycle garage management
- Motorcycle dashboard and details
- Maintenance records and reminders
- Fuel tracking
- Service history
- Vehicle document tracking
- Light and dark themes
- Local reminder notifications

## Project structure

```text
src/
├── api/                  API clients for bikes and vehicle records
├── app/                  Expo Router screens and layouts
│   ├── (auth)/           Authentication screens
│   ├── (tabs)/           Main tab navigation
│   └── bike/             Bike details and record screens
├── components/           Reusable UI and feature components
├── constants/            Shared theme and app constants
├── context/              React context providers
├── hooks/                Shared React hooks
├── lib/                  Notifications and reminder scheduling
└── types/                API and domain TypeScript types
```

Every file in `src/app/` is a route. Keep reusable components, hooks, and
utilities outside that directory.

## API and authentication

The API client reads `EXPO_PUBLIC_API_URL` and defaults to
`http://localhost:8000/api`. Requests use the current Clerk session token.
Ensure the API is running and that its Clerk configuration belongs to the same
Clerk application as `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.

See the backend route reference in
[`../server/README.md`](../server/README.md).

## Notifications

Reminder notifications require a physical device. Simulators and emulators may
not reliably receive them. The app requests notification permission when the
root layout mounts and schedules future reminders locally.

## Building with EAS

Use EAS for cloud builds and releases:

```bash
npx eas-cli@latest build
```

Configure signing credentials and build profiles before creating a production
build. The Expo project ID and platform identifiers are configured in
[`app.json`](./app.json).

## Troubleshooting

### The app cannot reach the API

1. Confirm the server is running.
2. Confirm `EXPO_PUBLIC_API_URL` points to the correct host for the selected
   device or emulator.
3. Confirm the device and computer are on the same network when using a
   physical device.
4. Restart Expo after changing `.env` values.

### Clerk authentication fails

Check that `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is present, starts with the
correct Clerk prefix, and belongs to the same environment as the backend
credentials.

### Native module changes are not reflected

Rebuild the development client after adding or changing a native dependency:

```bash
npx expo run:android
# or
npx expo run:ios
```