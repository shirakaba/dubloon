<h1 align="center">Dubloon 🌐📲</h2>

# About

Launch straight into a WebView in a React Native (Expo) app.

_It's called "Dubloon" because that sounds a bit like the first part of "WWW"._

# Running the demo

## Prerequisites

First, go through Expo's [environment setup](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build) instructions if you haven't already.

## How to set up the repo

```sh
# Install the npm dependencies
npm install

# Install the iOS CocoaPods (if targeting iOS)
cd ios && pod install && cd ..
```

## How to run the demo

Instructions differ depending on whether you're running debug mode or release mode.

### Debug mode

In debug mode, the native app will load the web app from the Vite dev server.

#### Serving the web app (all platforms)

Whether you plan to run iOS, Android, or both at the same time, you will need to have the dev server for the web app running.

```sh
cd web
npm run dev
```

You can visit the website in your desktop browser at http://127.0.0.1.

#### iOS

After starting the web app (see above), in another terminal at the repo root, run the iOS app.

```sh
npm run ios
```

#### Android

After starting the web app (see above), in another terminal at the repo root, run the Android app.

_TODO: Document networking for simulator vs. real devices._

```sh
npm run android
```

### Release mode

In release mode, the app will load the ready-built web app from the file system. To perform a release build (of both the web app and the native app), do the following:

#### iOS

```sh
npm run ios --configuration Release
```

#### Android

```sh
npm run android --variant release
```

# Installing Dubloon in your own project

The Dubloon demo is powered by an Expo config plugin, which you can install in your own projects.
