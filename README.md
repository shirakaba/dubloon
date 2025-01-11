<h1 align="center">Dubloon 🌐📲</h2>

# About

An Expo Config Plugin for embedding a web app inside a React Native (Expo) app. It's a library that gives you a development experience similar to Capacitor or Electron, but with full access to the React Native and Expo ecosystems.

_It's called "Dubloon" (based on [doubloon](https://en.wikipedia.org/wiki/Doubloon)) because the "dub" sounds a bit like the first part of "WWW" and quite frankly because everyone's taken all the good names already._

# Monorepo structure

```
.
├── apps
│   ├── example      # The example Expo app
│   └── web          # The web app loaded by the Expo app's WebView
└── packages
    └── dubloon     # The Dubloon library
        ├── plugin   # The Expo Config Plugin
        └── src      # The API for Dubloon
```

# Using Dubloon

## Installation

The Dubloon example app (`apps/example`) is powered by an Expo config plugin (`packages/dubloon`), which you can install in your own projects.

```sh
# TODO: I need to publish the package. The name "dubloon" is taken, sadly, so
# we'll have to rewrite these instructions once the name is finalised.
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
          "webWorkingDir": "../web",
          "webOutputDir": "../web/dist"
        }
      ]
    ]
  }
}
```

See the `DubloonProps` interface in [packages/dubloon/plugin/src/DubloonProps.types.ts](packages/dubloon/plugin/src/DubloonProps.types.ts) for documentation on the options such as `webWorkingDir` and `webOutputDir`.

# Running the demo

See [apps/example/README.md](apps/web/README.md).
