<h1 align="center">The Doubloon example web app 🌐</h2>

This web app is loaded into a WebView by the Doubloon example Expo app in [apps/example](/apps/example).

# How to run the web app

## Debug mode

```sh
cd apps/web
npm run dev

# Now visit the URL that the CLI prints out, in your desktop web browser.
# Next, try running up the Expo example app and viewing it from there.
```

## Release build

```sh
cd apps/web
npm run build
npm run preview

# Now visit the URL that the CLI prints out, in your desktop web browser.
# When you run a release build of the Expo example app, it'll automatically run
# a release build of the web app and bundle it into the Expo app.
```
