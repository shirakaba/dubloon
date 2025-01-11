<h1 align="center">The Dubloon example Expo app 📱</h2>

This Expo app loads the web app in [apps/web](/apps/web) into a WebView.

# How to run the demo

## Installation

If you haven't already, go through Expo's [environment setup](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build) instructions to get set up. You will also need [bun](https://bun.sh/docs/installation) to use this monorepo.

Next, install the npm dependencies for the monorepo:

```sh
bun install
```

## Running the demo

Instructions differ depending on whether you're running debug mode or release mode.

### Debug mode

In debug mode, the native app in `apps/example` will load the web app from the Vite dev server in `apps/web`.

So whether you plan to run iOS, Android, or both at the same time, you will **need to have the web app's dev server running**. Here's how to run it:

```sh
cd apps/web
npm run dev
```

Confirm that it's running by visiting the website in your desktop browser at http://127.0.0.1:5173, then follow the platform-specific steps below.

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

### Android

```sh
cd apps/example
npm run android --variant release
```
