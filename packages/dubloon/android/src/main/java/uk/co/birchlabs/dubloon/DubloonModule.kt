package uk.co.birchlabs.dubloon

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.core.utilities.EmulatorUtilities

class DubloonModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("Dubloon")

    Constants (
      "isDevice" to !isRunningOnEmulator,
      "basePath" to "file:///android_asset/",
    )
  }

  companion object {
    // https://github.com/expo/expo/blob/034d4ff1c7b5fff88358a2a5cd4fa9f24baee570/packages/expo-device/android/src/main/java/expo/modules/device/DeviceModule.kt#L132-L133
    private val isRunningOnEmulator: Boolean
      get() = EmulatorUtilities.isRunningOnEmulator()
  }
}
