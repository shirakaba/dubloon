import { Platform } from "react-native";
import type { WebViewProps } from "react-native-webview";
import { default as DubloonModule } from "./DubloonModule";

export function connectionProps({
  port,
  bundleDirName = "web",
  path = "/index.html",
}: {
  /**
   * The port that the web app's dev server serves on.
   */
  port: number;

  /**
   * The directory to copy the contents of webOutputDir into. Directories with
   * slashes will be interpreted as a nested path.
   *
   * - In debug mode, this has no effect.
   * - In release mode, this affects the file path the URL should load the
   * bundled app from.
   *
   * @default "web"
   * @example "nested/path/to/web"
   */
  bundleDirName?: string;

  /**
   * The path making up the URI by which to connect to the dev server.
   * @default "/index.html"
   * @example If the base URL were "http://127.0.0.1:3000", specifying a value
   * of "/index.html" would yield "http://127.0.0.1:3000/index.html".
   */
  path?: string;
}) {
  if (__DEV__) {
    /**
     * We explicitly use 127.0.0.1 because that's what the Android emulator maps
     * to. This avoids problems on IPv6 setups where localhost may map to ::1.
     *
     * (This is mainly a concern on Android; on iOS, both simulators and real
     * devices can happily use localhost with a Mac.)
     */
    const localLoopbackIPv4 = "127.0.0.1";

    // We work out the
    let host: string;
    switch (Platform.OS) {
      case "ios": {
        // React Native iOS physical devices connect to the packager over a LAN
        // IP, e.g. http://192.168.11.2:8081, which we retrieve from
        // `DubloonModule.packagerHost`.
        host = DubloonModule.isDevice
          ? DubloonModule.packagerHost
          : localLoopbackIPv4;
        break;
      }
      case "android": {
        /**
         * This "magic" host maps to 127.0.0.1 on Android Virtual Devices.
         *
         * Apparently it's instead 10.0.2.3 on Genymotion devices though, and
         * it's presumably possible to configure it, so we'd better handle those
         * cases in future.
         * @see https://developer.android.com/studio/run/emulator-networking.html
         * @see https://stackoverflow.com/a/26072075/5951226
         */
        const androidEmulatorHost = "10.0.2.2";

        // React Native Android physical devices connect either via:
        //
        // - the explicit host configured in the in-app Dev Menu (as recommended
        //   when [connecting over Wi-Fi](https://reactnative.dev/docs/running-on-device#method-2-connect-via-wi-fi)).
        // - or via ws://localhost:8081 (and thus relies on reverse-proxying localhost
        //   via [adb reverse](https://reactnative.dev/docs/running-on-device#method-1-using-adb-reverse-recommended), e.g. via
        //   `adb -s HA1K19BG reverse tcp:8081 tcp:8081`.
        host = DubloonModule.isDevice ? localLoopbackIPv4 : androidEmulatorHost;
        break;
      }
      default: {
        host = localLoopbackIPv4;
        break;
      }
    }

    const uri = `http://${host}:${port}/`;

    return {
      source: { uri },
    } as Pick<WebViewProps, "source">;
  }

  const webRoot = `${DubloonModule.basePath}${bundleDirName}`;

  return {
    allowFileAccessFromFileURLs: true,
    // Specifying 'file://*' in here is necessary to stop the WebView
    // from treating file URLs as being blocklisted. Blocklisted URLs
    // get opened via Linking (to be passed on to Safari) instead.
    originWhitelist: ["file://*"],
    allowingReadAccessToURL: webRoot,
    source: { uri: `${webRoot}${path}` },
  };
}
