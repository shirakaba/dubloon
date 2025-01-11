import ExpoModulesCore

public class DubloonModule: Module {
  public func definition() -> ModuleDefinition {
    Name("Dubloon")

    Constants([
      "isDevice": isDevice(),
      "basePath": getBasePath(),
    ])
  }
}

// https://github.com/expo/expo/blob/034d4ff1c7b5fff88358a2a5cd4fa9f24baee570/packages/expo-device/ios/DeviceModule.swift#L66-L72
func isDevice() -> Bool {
#if targetEnvironment(simulator)
  return false
#else
  return true
#endif
}

func getBasePath() -> String {
#if os(macOS)
  return "\(Bundle.main.bundlePath)Contents/Resources/"
#endif

  // https://github.com/expo/expo/blob/ef446673a278ed9189c0b3056ff0845067a4e5fa/packages/expo-file-system/ios/FileSystemModule.swift#L33
  return Bundle.main.bundlePath
}
