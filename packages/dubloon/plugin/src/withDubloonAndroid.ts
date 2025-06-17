import type { ExportedConfigWithProps } from "@expo/config-plugins";
import type { GradleProjectFile } from "@expo/config-plugins/build/android/Paths";
import path from "node:path";
import type { DubloonProps } from "./DubloonProps";
import { normalizeDubloonProps } from "./normaliseDubloonProps";

export function makeGradleScript({
  expoConfig,
  dubloonProps,
}: {
  expoConfig: ExportedConfigWithProps<GradleProjectFile>;
  dubloonProps: DubloonProps;
}) {
  const { webBuildCommands, bundleDirName, webWorkingDir, webOutputDir } =
    normalizeDubloonProps(dubloonProps);

  const webBuildCommand = webBuildCommands.android;
  if (!Array.isArray(webBuildCommand)) {
    throw new Error(
      `[Dubloon] Please provide webBuildCommands.android as an array of strings, rather than a string (only non-Android platforms support both strings and arrays of strings).`
    );
  }

  const bundleDirNameNormalized = path.normalize(bundleDirName);

  return `
tasks.register("dubloonBundleWebApp", Exec) {
    workingDir = file(["node", "--print", "require('node:path').resolve('$projectRoot', '${webWorkingDir}')"].execute(null, rootDir).text.trim())
    commandLine = ${JSON.stringify(webBuildCommand)}
    doFirst {
        println("[Dubloon] Building the web app...")
    }
    doLast {
        println("[Dubloon] ... Built the web app.")
    }
}

// Crudely determine whether this is a release-mode variant.
// We look for the task "createBundle\${targetName}JsAndAssets", as it's
// registered by React Native, so is guaranteed to be present.
// https://github.com/facebook/react-native/blob/ec72af403ca6cc64a6c7e99b00a6a6b5d56ff2db/packages/gradle-plugin/react-native-gradle-plugin/src/main/kotlin/com/facebook/react/TaskConfiguration.kt#L58
def isReleaseVariant = tasks.any { it.name == "createBundleReleaseJsAndAssets" }
tasks.configureEach { task ->
    if (!isReleaseVariant || task.name != 'preBuild') {
        return;
    }

    task.dependsOn("dubloonBundleWebApp");

    task.doLast {
        println("[Dubloon] Copying the web app build into the app bundle...");

        copy {
            from(["node", "--print", "require('node:path').resolve('$projectRoot', '${webOutputDir}')"].execute(null, rootDir).text.trim());
            into("$rootDir/app/src/main/assets/${bundleDirNameNormalized}");
        }

        println("[Dubloon] ... Copied the web app build into the app bundle.");
    }
}
`.trim();
}
