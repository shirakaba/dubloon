# Troubleshooting

This page details solutions to common issues.

## The WebView is blank/empty

Perform the following sanity checks.

### Is the dev server for the web app running?

When developing in **debug** mode (rather than **release** mode), the Dubloon WebView expects to connect to a local web dev server (e.g. Vite, Webpack, Rollup, etc.). Make sure it's running.

For example, in this monorepo, you can run the web dev server as follows:

```sh
cd apps/web
npm run dev
```

This logs out the following:

```sh
> dubloon-web-app@0.0.0 dev
> vite --host 127.0.0.1 --port 5173

  VITE v6.0.7  ready in 84 ms

  ➜  Local:   http://127.0.0.1:5173/
  ➜  press h + enter to show help
```

You can try connecting to it by visiting http://127.0.0.1:5173/ in your desktop web browser.

### Is the Dubloon WebView connecting to the correct address for the web app's dev server?

In this monorepo, our example web app in `apps/web` has a command `npm run dev` that runs a dev server on port 5173 (the default for Vite apps). However, your own web app's dev server might run on a different port.

Most bundlers log the address that they bind to on startup. You can usually configure it via the `--port` argument passed to the CLI command used to start the bundler, or via the `port` field in a config file (e.g. `webpack.config.js`).

Once you know the port, you can configure it in the options for `connectionProps()`:

```tsx
import { connectionProps } from "dubloon";
import WebView from "react-native-webview";

export default function MyWebView() {
  return <WebView {...connectionProps({ port: 8080 })} />;
}
```

### Is the web app displaying in a desktop web browser as expected?

Before debugging the Dubloon WebView itself, it's worth visiting your web app in a desktop web browser (see **"Is the dev server for the web app running?"** for instructions) to check that it appears as expected.

For example, when setting up the example web app for this monorepo, I found that it was rendering a blank page because my monorepo had two different versions of React installed.

### Is the WebView sized correctly?

Because `<WebView>` has no intrinsic size. [By default](https://github.com/react-native-webview/react-native-webview/blob/4733fe7988f1a4489f0d430ffcbe152416fe1b0e/src/WebView.styles.ts#L5), it has `{ flex: 1 }` styling, so it sizes to **fill its container**. It doesn't matter whether the webpage contents are big or small – the `<WebView>` will not grow to fit them.

Thus, for the `<WebView>` to be non-zero in size, you need to satisfy two constraints:

1. The container must be non-zero in size
2. The container must not derive its own size from its children (i.e. must not use `auto` sizing)

Here are some recipes that size the `<WebView>` correctly:

```tsx
import { View, SafeAreaView } from "react-native";
import WebView from "react-native-webview";

export function One() {
  return (
    // This works because it makes the container fill the available space,
    // stopping it from deriving its size from its unsized children.
    <SafeAreaView style={{ flex: 1 }}>
      <WebView />
    </SafeAreaView>
  );
}

export function Two() {
  return (
    // This gives the container an explicit size for its main axis, again
    // stopping it from deriving its main axis size from its unsized children.
    <SafeAreaView style={{ height: "100%" }}>
      <WebView />
    </SafeAreaView>
  );
}

export function Three() {
  return (
    // Or if you really don't know what you're doing, just spam everything 😄
    <SafeAreaView style={{ flex: 1, width: "100%", height: "100%" }}>
      <WebView />
    </SafeAreaView>
  );
}

export function Four() {
  return (
    // Place the SafeAreaView inside a View to customise the unsafe area's colour:
    <View style={{ backgroundColor: "gold" }}>
      <SafeAreaView style={{ flex: 1 }}>
        <WebView />
      </SafeAreaView>
    </View>
  );
}
```

### Is your networking set up correctly?

#### iOS

If your WebView is blank, or displays this error:

> **Error loading page**
>
> Domain: NSURLErrorDomain
> Error Code: -1004
> Description: Could not connect to the server.

… it means that the native app can't connect to the web app's dev server.

Go through this sanity check, based on which device type you're using. Ensure that:

##### Simulator

- Your web app's dev server is bound to either of these hosts:
  - `127.0.0.1` (i.e. the IPv4 local loopback).
  - `0.0.0.0` (i.e. all interfaces). This is recommended as it is needed to support physical devices, but be wary that it means any device on the network can connect to it (so don't use for confidential work).
- You're passing into the WebView the props from `connectionProps`, e.g. `<WebView {...connectionProps({ port: 8080 })} />` (where port `8080` would be the port that your web app's dev server is running on).
- You can successfully connect to the web app's dev server's URL on macOS Safari.

##### Physical device

- Your web app's dev server is binding to host `0.0.0.0` (i.e. all interfaces).
- You're passing into the WebView the props from `connectionProps`, e.g. `<WebView {...connectionProps({ port: 8080 })} />` (where port `8080` would be the port that your web app's dev server is running on).
- You can successfully connect to the web app's dev server's URL (e.g. http://192.168.11.2:8080) on iOS Safari.

#### Android

##### Emulator

(Same as for iOS simulator.)

##### Physical device

Same as for iOS physical devices, but additionally ensure:

###### Connecting over USB cable

- You can successfully connect to the web app's dev server's URL (e.g. http://172.0.0.1:8080) on your Android device's default browser.
- Run the following commands to reverse-proxy ports from your development computer's local loopback interface to your device:

  ```sh
  # List your devices to get the name of your physical device ("HA1K19BG" in this
  # example).
  adb devices

  # 1. Map the packager (Metro) port as usual (if you haven't already):
  adb -s HA1K19BG reverse tcp:8081 tcp:8081

  # 2. Map the web app's dev server port:
  adb -s HA1K19BG reverse tcp:8080 tcp:8080
  ```

  These steps are an extension of the official instructions for running React Native on an Android device [over USB](https://reactnative.dev/docs/running-on-device#method-1-using-adb-reverse-recommended).

- Your computer's firewall allows the port for your dev server (e.g. `8080`) accessed.

###### Connecting over Wi-Fi

Not currently supported. Contributions welcome.

### Does your app have local networking enabled?

Both React Native and Expo apps are **set up correctly by default** for local networking (because they need it for communicating with Metro when running in debug mode), so the Dubloon Expo Config mod does not bother applying any changes to the `Info.plist` files. However, we document the expected state below just in case.

<details>
<summary>Show</summary>

#### iOS

Both the React Native and Expo templates have a suitable `Info.plist` file for local networking.

The React Native TypeScript template's [Info.plist](https://github.com/react-native-community/react-native-template-typescript/blob/f1d6de596a126dbbb8259588dba660d263f137b1/template/ios/HelloWorld/Info.plist#L27-L37) is based on the older [NSExceptionAllowsInsecureHTTPLoads](https://developer.apple.com/documentation/bundleresources/information-property-list/nsexceptionallowsinsecurehttploads) key:

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSExceptionDomains</key>
  <dict>
    <key>localhost</key>
    <dict>
      <key>NSExceptionAllowsInsecureHTTPLoads</key>
      <true/>
    </dict>
  </dict>
</dict>
```

The Expo iOS `bare-minimum` template's [Info.plist](https://github.com/expo/expo/blob/26346fd338af47c7e8996b3b15db5846605f378d/templates/expo-template-bare-minimum/ios/HelloWorld/Info.plist#L29-L35) is based on the newer [NSAllowsLocalNetworking](https://developer.apple.com/documentation/bundleresources/information-property-list/nsapptransportsecurity/nsallowslocalnetworking#Discussion) key introduced in iOS 10:

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <false/>
  <key>NSAllowsLocalNetworking</key>
  <true/>
</dict>
```

#### Android

Both the React Native and Expo templates have a suitable `android/app/src/debug/AndroidManifest.xml` file for local networking.

The React Native Android template's [android/app/src/debug/AndroidManifest.xml](https://github.com/react-native-community/react-native-template-typescript/blob/f1d6de596a126dbbb8259588dba660d263f137b1/template/android/app/src/debug/AndroidManifest.xml#L8) configures [android:usesClearTextTraffic](https://developer.android.com/guide/topics/manifest/application-element#usesCleartextTraffic) correctly for apps targeting API level 28 or higher (it's enabled by default on API levels lower than those).

```xml
<!-- I've truncated this file to just the relevant keys. To see the full file, visit the link above. -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android" xmlns:tools="http://schemas.android.com/tools">
    <application android:usesCleartextTraffic="true" tools:targetApi="28">
        <activity android:name="com.facebook.react.devsupport.DevSettingsActivity" android:exported="false" />
    </application>
</manifest>
```

The Expo Android `bare-minimum` template's [android/app/src/debug/AndroidManifest.xml](https://github.com/expo/expo/blob/26346fd338af47c7e8996b3b15db5846605f378d/templates/expo-template-bare-minimum/android/app/src/debug/AndroidManifest.xml#L6) is much the same, just missing the inner `<activity>`.

```xml
<!-- I've truncated this file to just the relevant keys. To see the full file, visit the link above. -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android" xmlns:tools="http://schemas.android.com/tools">
    <application android:usesCleartextTraffic="true" tools:targetApi="28" tools:replace="android:usesCleartextTraffic" />
</manifest>
```

</details>

## I can't connect the Safari Web Inspector or Chrome DevTools to my WebView

For full steps, follow `react-native-webview`'s guide to [Debugging WebView Contents](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Debugging.md#debugging-webview-contents).

A common problem, though, is to forget to set the relatively new [webviewDebuggingEnabled](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md#webviewDebuggingEnabled) prop. Best practice is to enable it only in debug builds to prevent the user debugging your app:

```tsx
<WebView webviewDebuggingEnabled={__DEV__}>
```

Note also that Safari can also be fairly unreliable at detecting debuggable targets, so if your device and/or WebView is not appearing in the Develop menu, it's worth exiting and reopening Safari.

## The WebView's contents are displaced by, or overlapped by, the status bar

This section details how to handle the safe area with `<WebView>`.

### I want to draw into the unsafe area

#### Drawing native content into the unsafe area

```tsx
import { View, SafeAreaView } from "react-native";
import WebView from "react-native-webview";

export function One() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView />
    </SafeAreaView>
  );
}

export function Two() {
  return (
    // Place the SafeAreaView inside a View to customise the unsafe area's colour:
    <View style={{ backgroundColor: "gold" }}>
      <SafeAreaView style={{ flex: 1 }}>
        <WebView />
      </SafeAreaView>
    </View>
  );
}
```

#### Drawing web content into the unsafe area

Make your `<WebView>` the root visual component of your app:

```tsx
import WebView from "react-native-webview";

export default function App() {
  return <WebView />;
}
```

Next, ensure that all the web pages in your web app include this [viewport meta tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag) with `viewport-fit=cover` set:

```html
<meta name="viewport" content="initial-scale=1, viewport-fit=cover" />
```

Next, you can use the CSS [safe-area-\* environment variables](https://developer.mozilla.org/en-US/docs/Web/CSS/env) to offset your HTML elements as you please:

```css
body {
  /* prettier-ignore */
  padding: env(safe-area-inset-top, 20px) env(safe-area-inset-right, 20px) env(safe-area-inset-bottom, 20px) env(safe-area-inset-left, 20px);
}
```

For full details, read Apple's original introduction to the safe area: [Designing Websites for iPhone X](https://webkit.org/blog/7929/designing-websites-for-iphone-x/).

### I want the whole web app to be bounded to the safe area

First, it's worth checking whether the default `<WebView>` behaviour meets your needs. `<WebView>` is clever and will lay out content to avoid the safe area as long as the web page's [viewport meta tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag) isn't set to `viewport-fit=cover`.

```tsx
import { View, SafeAreaView } from "react-native";
import WebView from "react-native-webview";

export default function App() {
  return <WebView />;
}
```

You may notice, on tall web pages, that the content flows off the screen and through the bottom unsafe area. If that doesn't suit you, then you can alternatively use a `<SafeAreaView>` to bound the WebView. Here are some recipes:

```tsx
import { View, SafeAreaView } from "react-native";
import WebView from "react-native-webview";

export function One() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView />
    </SafeAreaView>
  );
}

export function Two() {
  return (
    // Place the SafeAreaView inside a View to customise the unsafe area's colour:
    <View style={{ backgroundColor: "gold" }}>
      <SafeAreaView style={{ flex: 1 }}>
        <WebView />
      </SafeAreaView>
    </View>
  );
}
```

## The release build is failing

By default, the release build uses the `node --run build` command. The [--run](https://nodejs.org/docs/latest/api/cli.html#--run) flag was only introduced in Node.js v22.0.0, so make sure that your Node.js is up to date.

This command is essentially equivalent to `npm run build`, so it assumes that your web app, located at the directory you configured in `app.json` via the [webWorkingDir](https://shirakaba.github.io/dubloon/plugin/~/DubloonProps.html#property_webworkingdir) option, has an npm script field named `"build"` in its `package.json`.

## Error when running on iOS in debug mode "Could not connect to the server"

If your WebView displays this error:

> **Error loading page**
>
> Domain: NSURLErrorDomain
> Error Code: -1004
> Description: Could not connect to the server.

… it means that the native app can't connect to the web app's dev server.

Follow the instructions in **Is your networking set up correctly?** to fix.
