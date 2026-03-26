<h1 align="center">Dubloon 🌐📲</h2>

# About

An Expo [Config Plugin](https://docs.expo.dev/config-plugins/introduction/) for embedding a web app inside a React Native (Expo) app. It's a library that gives you a development experience similar to Capacitor or Electron, but with full access to the React Native and Expo ecosystems. Not just a toy - used successfully in production on iOS, Android, macOS, and Windows (though the config plugin only handles iOS and Android).

_It's called "Dubloon" (based on [doubloon](https://en.wikipedia.org/wiki/Doubloon)) because the "dub" sounds a bit like the first part of "WWW" and quite frankly because everyone's taken all the good names already._

# Monorepo structure

```
.
├── apps
│   ├── example      # The example Expo app
│   └── web          # The web app loaded by the Expo app's WebView
└── packages
    └── dubloon      # The Dubloon library
        ├── plugin   # The Expo Config Plugin
        └── src      # The API for Dubloon
```

# Using Dubloon

## Installation

Dubloon is intended to be used together with [react-native-webview](https://github.com/react-native-webview/react-native-webview), so make sure you install both.

```sh
npm install dubloon react-native-webview
```

## Setup

Configure your Expo app's `app.json` file to use the Dubloon Expo Config plugin:

```js
{
  "expo": {
    // ... omitted...
    "plugins": [
      [
        "dubloon",
        {
          "config": {
            "webWorkingDir": "../path/to/web/app",
            "webOutputDir": "../path/to/web/app/build"
          }
        }
      ]
    ]
  }
}
```

_See our [plugin docs](https://shirakaba.github.io/dubloon/plugin/~/DubloonProps.html) for documentation on the options._

Finally, apply the Config Plugin by running Expo [Prebuild](https://docs.expo.dev/workflow/continuous-native-generation/#usage):

```sh
npx expo prebuild --clean
```

## Usage

```tsx
import { connectionProps } from "dubloon";
import WebView from "react-native-webview";

export default function App() {
  // Where "8080" is the port for your web app's dev server.
  return <WebView {...connectionProps({ port: 8080 })} />;
}
```

## Running

Dubloon behaves differently between debug mode and release mode.

### Debug mode

In **debug mode**, your Expo app will load the web app from your web app's dev server (it is your responsibility to provide one - see our example web app at [apps/web](apps/web) for reference).

```sh
# In terminal 1: Start up your web app's dev server.
cd path/to/web/app
npm run dev

# In terminal 2: Run your Expo app as usual.
cd path/to/expo/app
# Running in debug mode may work out of the box, or require extra steps:
# - iOS simulator:           ✅
# - Android emulator:        ✅
# - iOS physical device:     may require extra steps.
# - Android physical device: will require extra steps.
npm run ios
npm run android
```

If the app unexpectedly starts up with a blank WebView, or if you want to run on a **physical device**, see the [Troubleshooting docs](docs/Troubleshooting.md).

### Release mode

In **release mode**, your Expo app will trigger a build of the web app. It'll then bundle it into the native app's bundle, so no dev server is needed.

By default, it runs `node --run build` (which is simply Node's own [equivalent](https://nodejs.org/docs/latest/api/cli.html#--run) of `npm run build`) in the configured [webWorkingDir](https://shirakaba.github.io/dubloon/plugin/~/DubloonProps.html#property_webworkingdir). See our [plugin docs](https://shirakaba.github.io/dubloon/plugin/~/DubloonProps.html) for more full details, or if you want to [customise the build command](https://shirakaba.github.io/dubloon/plugin/~/DubloonProps.webBuildCommands.html).

```sh
npm run ios --configuration Release
# or
npm run android --variant release
```

# Running the demo

See [apps/example/README.md](apps/example/README.md).
