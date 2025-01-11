import ExpoModulesCore

public class DubloonModule: Module {
  public func definition() -> ModuleDefinition {
    Name("Dubloon")

    Constants([
      "isDevice": isDevice(),
      "basePath": getBasePath(),
      "packagerHost": guessPackagerHost(),
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

// To avoid needlessly reading ip.txt more than once (as it'll never change), we
// do all this horrible lazy initialization.
private var ipGuess: String? = nil
private let ipGuessInitializationQueue = DispatchQueue(
  label: "uk.co.birchlabs.ipGuessInitializationQueue")

/// Guesses the React Native packager (i.e. Metro bundler) host based on reading
/// $DEST/ip.txt, which gets written during the "bundle React Native code and
/// images" build phase by react-native-xcode.sh. It returns a LAN IP such as
//  "192.168.11.2".
///
/// We use this as the basis to connect to the web app's dev server from
/// physical devices (it's likely that the web app's dev server is running on
/// the same host as the React Native packager).
///
/// @see https://github.com/facebook/react-native/blob/83699228c08fd89f39e385fb995cbab3c8b5c628/packages/react-native/React/Base/RCTBundleURLProvider.mm#L115
func guessPackagerHost() -> String {
  ipGuessInitializationQueue.sync {
    if ipGuess == nil {
      // TODO: confirm whether we need to add "Contents/Resources/" for macOS.
      if let ipPath = Bundle.main.path(forResource: "ip", ofType: "txt"),
        let contents = try? String(contentsOfFile: ipPath, encoding: .utf8)
      {
        ipGuess = contents.trimmingCharacters(in: .newlines)
      }
    }
  }

  let host = ipGuess ?? "localhost"

  // If we wanted to couple it to the Metro packager, we could add this guard:
  // guard RCTBundleURLProvider.isPackagerRunning(host) else {
  //     return nil
  // }

  return host
}
