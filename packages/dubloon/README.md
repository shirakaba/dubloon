<h1 align="center">The Dubloon library 🧰</h2>

# Structure

```
.
├── plugin   # The Expo Config Plugin
└── src      # The API for Dubloon
```

# Contributing

## Developing the plugin

To develop the plugin ([./plugin](./plugin)) code in watch mode:

```sh
cd packages/dubloon
npm run dev:plugin

# In a separate terminal, prebuild the Expo iOS and Android apps
cd apps/example
npx expo prebuild
```

I don't normally bother passing the `--clean` flag to `npx expo prebuild` because it takes so long to reinstall the CocoaPods; instead, if I ever want to undo any actions, I just manually discard any changes via git source control.

## Developing the APIs (/src)

To develop the APIs ([./src](./src)) code in watch mode:

```sh
cd packages/dubloon
npm run dev:module

# In a separate terminal, run the iOS or Android example Expo app
cd apps/example
npm run ios
```
