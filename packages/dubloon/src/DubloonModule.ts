import { NativeModule, requireNativeModule } from "expo";

// https://github.com/expo/expo/blob/034d4ff1c7b5fff88358a2a5cd4fa9f24baee570/packages/expo-device/src/Device.ts#L12
declare class DubloonModule extends NativeModule {
  isDevice: boolean;
  basePath: string;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<DubloonModule>("Dubloon");
