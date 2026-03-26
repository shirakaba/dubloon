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

### For iOS and Android

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

### For macOS

Until Expo supports Config Plugins for `react-native-macos`, this step has to be done manually. It's needed to support release builds.

Open your Xcode project, navigate to the build phases for your macOS app target, and press the `+` button, then select `New Run Script Phase` from the drop-down menu. In that run script phase, fill in the following details:

- Shell: `/bin/sh`
- Script:
  This is based on the Expo `Bundle React Native code and images` run script phase. Essentially, it changes directory into your `webWorkingDir`, runs `node --run build` to build your web app, and then copies the `webOutputDir` into your app bundle.

  ```sh
  set -x -e

  if [[ "$CONFIGURATION" = *Debug* ]]; then
    exit 0
  fi

  if [[ -f "$PODS_ROOT/../.xcode.env" ]]; then
    source "$PODS_ROOT/../.xcode.env"
  fi
  if [[ -f "$PODS_ROOT/../.xcode.env.local" ]]; then
    source "$PODS_ROOT/../.xcode.env.local"
  fi

  # The project root by default is one level up from the macos directory
  export PROJECT_ROOT="$PROJECT_DIR"/..

  echo "[Dubloon] Building the web app..."

  # With reference to node_modules/react-native/scripts/react-native-xcode.sh
  export WEB_CWD=$("$NODE_BINARY" --print "require('node:path').resolve('$PROJECT_ROOT', 'web')")
  echo "[Dubloon] Resolved WEB_CWD as: \"$WEB_CWD\""
  export DEST=$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH

  pushd "$WEB_CWD"
  "$NODE_BINARY" --run build
  popd

  echo "[Dubloon] ... Built the web app."

  echo "[Dubloon] Copying the web app build into the app bundle..."
  export WEB_DIST=$("$NODE_BINARY" --print "require('node:path').resolve('$PROJECT_ROOT', 'web/dist')")
  echo "[Dubloon] Resolved WEB_DIST as: \"$WEB_DIST\""
  mkdir -vp "$DEST/web"
  cp -r "$WEB_DIST/" "$DEST/web"
  echo "[Dubloon] ... Copied the web app build into the app bundle."
  ```

- Other options (checkboxes, files, file lists): nothing special; leave as default.

### For Windows

Windows is honestly rather hard to set up, but it can be done.

#### Patching React Native WebView

Until virtual host support can be upstreamed, you will need to patch `react-native-webview` to hard-code support for a virtual host named `https://dubloon-virtual`. This is needed to access web assets on the file system without running into CORS issues.

To do so, add this line inside `windows/ReactNativeWebView/ReactWebView2.cpp`, inside [`ReactWebView2::NavigateWithWebResourceRequest`](https://github.com/react-native-webview/react-native-webview/blob/8b50af5ad6cb5ae0699b25c8ee70cd4d8a1f167c/windows/ReactNativeWebView/ReactWebView2.cpp#L409):

```diff
+ CoreWebView2().SetVirtualHostNameToFolderMapping(
+   L"dubloon-virtual",
+   L"Assets",
+   CoreWebView2HostResourceAccessKind::Allow
+ )
```

This allows us to visit the URL https://dubloon-virtual/web/index.html to access a file such as file:///C:/Users/Jamie/git/banana-app/windows/banana.Package/bin/x64/Release/Assets/web/index.html.

References:

- https://learn.microsoft.com/en-us/dotnet/api/microsoft.web.webview2.core.corewebview2.setvirtualhostnametofoldermapping?view=webview2-dotnet-1.0.1054.31
- https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/working-with-local-content?tabs=dotnetcsharp

#### Reconfiguring the build pipeline

Next, we need to reconfigure the build pipeline to build and bundle the web app into the native app upon release builds.

Do the following (assuming your `bundleDirName` is `web`):

- gitignore `Assets/web`
- configure `msbuild` to:
  - build the web app and copy it into `Assets/web`
  - bundle `Assets/web/**/*` into the app upon release

... good luck!

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
