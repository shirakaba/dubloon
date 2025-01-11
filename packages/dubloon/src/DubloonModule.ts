import { NativeModule, requireNativeModule } from "expo";

declare class DubloonModule extends NativeModule {
  /**
   * Whether the device is physical (true) or a simulator/emulator (false).
   */
  isDevice: boolean;

  /**
   * The base path for the web app's dev server.
   */
  basePath: string;

  /**
   * The host for the React Native packager (i.e. Metro). Used as the likely
   * host for the web app's dev server.
   * @example "192.168.11.2"
   *
   * 🚨 Only implemented on iOS for now.
   */
  packagerHost: string;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<DubloonModule>("Dubloon");
