<h1 align="center">Doubloon 🌐📲</h2>

# About

Launch straight into a WebView in a React Native (Expo) app.

_It's called "Doubloon" because that sounds a bit like the first part of "WWW"._

## Monorepo structure

```
.
├── apps
│   ├── example  # The example Expo app
│   └── web      # The web app loaded by the Expo app's WebView
└── packages
    └── plugin   # The Expo config plugin
```

# Running the demo

## Prerequisites

First, go through Expo's [environment setup](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build) instructions if you haven't already.

## How to set up the monorepo

```sh
# Install the npm dependencies
bun install
```

## How to run the demo

Instructions differ depending on whether you're running debug mode or release mode.

### Debug mode

In debug mode, the native app will load the web app from the Vite dev server.

#### Serving the web app (all platforms)

Whether you plan to run iOS, Android, or both at the same time, you will need to have the dev server for the web app running.

```sh
cd apps/web
npm run dev
```

You can visit the website in your desktop browser at http://127.0.0.1.

#### iOS

**After starting the web app** (see above), in another terminal, run the iOS app.

```sh
cd apps/example
npm run ios
```

#### Android

**After starting the web app** (see above), in another terminal, run the Android app.

_TODO: Document networking for simulator vs. real devices._

```sh
cd apps/example
npm run android
```

### Release mode

In release mode, the app will load the ready-built web app from the file system. To perform a release build (of both the web app and the native app), do the following:

#### iOS

```sh
cd apps/example
npm run ios --configuration Release
```

#### Android

```sh
cd apps/example
npm run android --variant release
```

# Installing Doubloon in your own project

The Doubloon example app (`apps/example`) is powered by an Expo config plugin (`packages/plugin`), which you can install in your own projects.
