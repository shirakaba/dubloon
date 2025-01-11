<h1 align="center">Doubloon 🌐📲</h2>

# About

An Expo Config Plugin for embedding a web app inside a React Native (Expo) app. It's a library that gives you a development experience similar to Capacitor or Electron, but with full access to the React Native and Expo ecosystems.

_It's called "Doubloon" because that sounds a bit like the first part of "WWW"._

# Monorepo structure

```
.
├── apps
│   ├── example      # The example Expo app
│   └── web          # The web app loaded by the Expo app's WebView
└── packages
    └── doubloon     # The Doubloon library
        ├── plugin   # The Expo Config Plugin
        └── src      # The API for Doubloon
```

# Using Doubloon

## Installation

The Doubloon example app (`apps/example`) is powered by an Expo config plugin (`packages/doubloon`), which you can install in your own projects.

```sh
# TODO: I need to publish the package. The name "doubloon" is taken, sadly, so
# we'll have to rewrite these instructions once the name is finalised.
npm install doubloon react-native-webview
```

## Configuration

Configure your Expo app's `app.json` file to use the Doubloon Expo Config plugin:

```js
{
  "expo": {
    // ... omitted...
    "plugins": [
      [
        "doubloon",
        {
          "webWorkingDir": "../web",
          "webOutputDir": "../web/dist"
        }
      ]
    ]
  }
}
```

See the `DoubloonProps` interface in [packages/doubloon/plugin/src/DoubloonProps.types.ts](packages/doubloon/plugin/src/DoubloonProps.types.ts) for documentation on the options such as `webWorkingDir` and `webOutputDir`.

# Running the demo

See [apps/example/README.md](apps/web/README.md).
