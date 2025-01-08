import { NativeModule, requireNativeModule } from "expo";

// https://github.com/expo/expo/blob/034d4ff1c7b5fff88358a2a5cd4fa9f24baee570/packages/expo-device/src/Device.ts#L12
declare class DoubloonModule extends NativeModule {
  isDevice: boolean;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<DoubloonModule>("Doubloon");
