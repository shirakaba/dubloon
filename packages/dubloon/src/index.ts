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
     * This "magic" host maps to 127.0.0.1.
     * @see https://developer.android.com/studio/run/emulator-networking.html
     */
    const androidEmulatorHost = "10.0.2.2";

    /**
     * We explicitly use 127.0.0.1 because that's what the Android emulator maps
     * to. This avoids problems on IPv6 setups where localhost may map to ::1.
     *
     * (This is mainly a concern on Android; on iOS, both simulators and real
     * devices can happily use localhost with a Mac.)
     */
    const localLoopbackIPv4 = "127.0.0.1";

    // TODO: once we support `packagerHost` for Android, use it for all device
    // types on all platforms, except for Android emulator.
    const ipForDevice = DubloonModule.isDevice
      ? DubloonModule.packagerHost
      : localLoopbackIPv4;

    const uri =
      Platform.OS === "android"
        ? // TODO: if it's a real Android device (check via
          // DubloonModule.isDevice), we may need to connect to a WAN address
          // instead. Will have to look into available options.
          `http://${androidEmulatorHost}:${port}/`
        : `http://${ipForDevice}:${port}/`;

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
