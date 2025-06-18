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

def monorepoRoot = file(projectRoot).getParentFile().getParentFile().getAbsolutePath();
def webWorkspace = "$monorepoRoot/apps/web";
def webViewBuildDir = file(["node", "--print", "const path = require('node:path'); path.resolve('$projectRoot', '${webOutputDir}')"].execute(null, rootDir).text.trim());

def getWebViewBuildDirScript = '''\\
const path = require('node:path');
const fs = require('node:fs');

const appJsonPath = path.resolve('$projectRoot', 'app.json');
let appJson;
try {
  appJson = fs.readFileSync(appJsonPath, "utf-8");
} catch (cause) {
  throw new Error(\`Unable to find "app.json" at expected path "\${appJson}". Is this not an Expo project?\`, { cause });
}

let appJsonParsed;
try {
  appJsonParsed = JSON.parse(appJson);
} catch (error) {
  throw new Error(\`Unable to parse "app.json" at path "\${appJson}". Is it valid JSON? Are there comments in it?\`, { cause });
}

if(typeof appJsonParsed !== "object" || appJsonParsed === null){
  throw new Error(\`Expected app.json at path "\${appJson}" to be an object.\`);
}

const plugins = appJsonParsed.expo?.plugins;
if(!Array.isArray(plugins)){
  throw new Error(\`Expected app.json at path "\${appJson}" to have an expo.plugins property, of type Array.\`);
}

const plugin = plugins.find((plugin) => Array.isArray(plugin) ? plugin[0] === "dubloon" : plugin === "dubloon");
if(
  !Array.isArray(plugin)
  || typeof plugin[1] !== "object" || plugin[1] === null
  || typeof plugin[1].config !== "object" || plugin[1].config === null
){
  throw new Error(\`Expected, inside app.json at path "\${appJson}", to find a plugin inside the expo.plugins property, named "dubloon", with props passed to it.\`);
}

// We're passing node --print, so this should print out.
path.resolve('$projectRoot', plugin[1].config);
'''

tasks.register("buildWebViewBundle", Exec) {
    workingDir = file(webWorkspace)
    commandLine = ["npm", "run", "build"]
    doFirst {
        println("Running \`npm run build\` to build the WebView bundle.")
    }
}

tasks.configureEach { task ->
    if (task.name != 'preBuild') {
        return;
    }

    task.dependsOn("buildWebViewBundle");

    task.doLast {
        println("Copying WebView bundle into app bundle...");

        def config = ["node", "--print", getWebViewBuildDirScript].execute(null, rootDir).text.trim()
        def configParsed = new groovy.json.JsonSlurper().parseText(config)

        if (!webViewBuildDir.exists()) {
            throw new FileNotFoundException("Missing ${webViewBuildDir}. Did the web workspace's build script not run?")
        }
        copy {
            from(webViewBuildDir);
            into("$rootDir/app/src/main/assets/web");
        }
    }
}
`.trim();
}
