<h1 align="center">Dubloon 🌐📲</h2>

# About

An Expo [Config Plugin](https://docs.expo.dev/config-plugins/introduction/) for embedding a web app inside a React Native (Expo) app. It's a library that gives you a development experience similar to Capacitor or Electron, but with full access to the React Native and Expo ecosystems.

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

```sh
npm install dubloon react-native-webview
```

## Configuration

Configure your Expo app's `app.json` file to use the Dubloon Expo Config plugin:

```js
{
  "expo": {
    // ... omitted...
    "plugins": [
      [
        "dubloon",
        {
          "webWorkingDir": "../path/to/web/app",
          "webOutputDir": "../path/to/web/app/build"
        }
      ]
    ]
  }
}
```

_See our [plugin docs](https://shirakaba.github.io/dubloon/plugin/~/DubloonProps.html) for documentation on the options._

Finally, apply the Config Plugin via Expo [Prebuild](https://docs.expo.dev/workflow/continuous-native-generation/#usage):

```sh
npx expo prebuild --clean
```

# Running the demo

See [apps/example/README.md](apps/example/README.md).
