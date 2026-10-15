# MotoCare Mobile

MotoCare is a mobile app for keeping track of a motorcycle:

- bikes in your garage
- maintenance and service history
- fuel purchases
- insurance, PUC, RC, and other documents
- reminders and light/dark mode

This folder contains the **mobile app**. It is built with **Expo**, which is a
toolkit that makes React Native apps easier to run on Android and iOS.

## Before you start

You need:

- Node.js 20 or newer
- npm (installed with Node.js)
- a Clerk application and its mobile publishable key
- the MotoCare API running locally
- one of these:
  - Android Studio and an Android emulator
  - macOS with Xcode and an iOS simulator
  - a physical phone

The API setup is documented in
[`../server/README.md`](../server/README.md).

> iOS apps can only be built locally on macOS. Android development works on
> Windows, macOS, and Linux.

## 1. Install the mobile app

Open a terminal in this folder:

```bash
cd mobile
npm install
```

`npm install` reads [`package.json`](./package.json) and downloads the
libraries used by the app. Run it again after pulling changes that update
`package.json` or `package-lock.json`.

## 2. Add environment variables

Create a file named `.env` directly inside the `mobile` folder:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

What these values mean:

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` connects the app to your Clerk login
  project.
- `EXPO_PUBLIC_API_URL` tells the app where the MotoCare backend is running.

Do not commit `.env`, Clerk secrets, or any real credentials. `.env` is ignored
by Git.

### Choosing the API URL

The correct URL depends on where the app is running:

| App is running on | API running on the development computer | Use |
| --- | --- | --- |
| Android emulator | Same computer | `http://10.0.2.2:8000/api` |
| iOS simulator | Same computer | `http://localhost:8000/api` |
| Physical phone | Same Wi-Fi network | `http://YOUR_COMPUTER_IP:8000/api` |

For a physical phone, replace `YOUR_COMPUTER_IP` with your computer's LAN IP,
for example `http://192.168.1.10:8000/api`. The phone and computer must be on
the same network, and the backend must allow connections from that network.

Restart Expo after changing `.env`.

## 3. Start the backend

In a second terminal, start the server by following
[`../server/README.md`](../server/README.md).

Keep that terminal running. The mobile app sends login and motorcycle data to
this server.

## 4. Start the Expo development server

In the `mobile` folder, run:

```bash
npm start
```

Expo will show a menu in the terminal. Use the menu to open the app, or run
one of these commands directly:

```bash
npm run android   # open on Android
npm run ios       # open on iOS (macOS only)
npm run web       # open the web version
```

You can also press the displayed keyboard shortcut, such as `a` for Android,
when Expo is running.

## A simple React Native explanation

If you are new to React Native, these are the folders you will use most:

```text
src/
├── app/          Screens and routes (Expo Router)
├── components/   Reusable UI, such as buttons and forms
├── api/          Functions that call the backend
├── types/        TypeScript shapes for API data
├── context/      Shared app state, including the theme
├── constants/    Shared colors, spacing, and typography
└── lib/          Utilities such as notifications
```

### How a screen works

Every file inside `src/app/` is a screen or navigation layout. This project
uses **Expo Router**, so the file path becomes the URL-like route:

```text
src/app/bike/[id]/fuel/add.tsx
```

The `[id]` part is a dynamic bike ID. Reusable UI should usually live in
`src/components/`, not inside `src/app/`.

### How a form saves data

Most forms follow this flow:

1. A screen renders a form component from `src/components/`.
2. The form stores what the user types with React's `useState`.
3. Pressing Save creates a typed object from `src/types/`.
4. An API helper in `src/api/` sends that object to the backend.
5. The screen refreshes its data and shows the updated result.

For example, the shared [`DateField`](./src/components/ui/DateField.tsx) is
used by Maintenance, Fuel, Service, and Document forms. It returns a normal
JavaScript `Date`; the form converts it to an ISO string before sending it to
the API.

## Important native-module note

The app uses native packages such as the date picker and notifications. Expo
Go does not always contain every native package used by the project. If you
add or change a native dependency, rebuild the development app:

```bash
npx expo run:android
# or, on macOS:
npx expo run:ios
```

For a cloud development build:

```bash
npx eas-cli@latest build --profile development
```

After the build completes, install that build on your device. Starting Metro
with `npm start` does not itself install native code.

## Useful commands

Run these commands from the `mobile` folder:

```bash
npm start             # start Expo
npm run android      # start Android app
npm run ios          # start iOS app
npm run web          # start web app
npm run lint         # check JavaScript/TypeScript style
npx tsc --noEmit     # check TypeScript types
```

Run lint and type checking before opening a pull request.

## Main features

- Clerk sign-up, sign-in, and session management
- motorcycle garage management
- bike dashboard and details
- maintenance records and reminders
- fuel tracking
- service history
- document tracking
- shared date pickers for historical entries
- light and dark themes
- local reminder notifications

## Notifications

Reminder notifications work most reliably on a physical device. Simulators and
emulators may not deliver them reliably. The app requests notification
permission and schedules reminders locally.

If notification configuration changes, rebuild the native app.

## Building with EAS

EAS creates installable builds in the cloud:

```bash
npx eas-cli@latest build --profile development
npx eas-cli@latest build --profile preview
npx eas-cli@latest build --profile production
```

The build profiles are defined in [`eas.json`](./eas.json). The Expo project
ID and Android/iOS identifiers are in [`app.json`](./app.json).

## Troubleshooting

### The app cannot reach the API

1. Check that the backend is running.
2. Check `EXPO_PUBLIC_API_URL` in `mobile/.env`.
3. Use the correct URL for your emulator or phone from the table above.
4. For a physical phone, check that both devices are on the same Wi-Fi.
5. Restart Expo after changing `.env`.

### Clerk authentication fails

Check that:

1. `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` exists in `.env`.
2. It starts with the correct Clerk prefix.
3. It belongs to the same Clerk project configured by the backend.

### A native package is not found

Install dependencies and rebuild the app:

```bash
npm install
npx expo run:android
# or
npx expo run:ios
```

### The app looks stale after a code change

Reload the Expo app. If that does not help, stop Expo and start it again:

```bash
npm start
```

Then use the reload option shown by Expo.
