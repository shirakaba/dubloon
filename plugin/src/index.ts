import path from "node:path";
import {
  ConfigPlugin,
  IOSConfig,
  type ModPlatform,
  withAppBuildGradle,
  withXcodeProject,
  type XcodeProject,
} from "expo/config-plugins";

const withDoubloon: ConfigPlugin<unknown> = (config, props) => {
  assertValidProps(props);

  config = withXcodeProject(config, async (config) => {
    const project = IOSConfig.XcodeUtils.getPbxproj(
      config.modRequest.projectRoot
    );

    ensureBuildPhase({
      project,
      buildPhaseName: "[Doubloon] Bundle and copy web app",
      buildPhaseArgs: {
        type: "PBXShellScriptBuildPhase",
        shellPath: "/bin/sh",
        // We escape line breaks as Xcode will otherwise do it anyway the moment
        // someone edits the script via the GUI.
        shellScript: makeXcodeShellScript(
          config.modRequest.platform,
          props
        ).replaceAll("\n", "\\n"),
      },
    });
    config.modResults = project;

    return config;
  });

  config = withAppBuildGradle(config, async (config) => {
    if (config.modResults.language !== "groovy") {
      throw new Error(
        `[Doubloon] Could not modify build.gradle as the file's language is "${config.modResults.language}", yet we only support Groovy.`
      );
    }

    const startAnchor = "// == Doubloon config plugin START ==";
    const endAnchor = "// == Doubloon config plugin END ==";
    const pattern = new RegExp(`${startAnchor}[\\s\\S]*${endAnchor}`, "m");

    const match = pattern.exec(config.modResults.contents);
    const anchoredScript = `${startAnchor}\n${makeGradleScript(
      props
    )}\n${endAnchor}`;

    if (match) {
      if (match[0] === anchoredScript) {
        // Already present, and no change needed.
        return config;
      }

      // Already present, but needs updating.
      const leading = config.modResults.contents.slice(0, match.index);
      const trailing = config.modResults.contents.slice(
        match.index + match[0].length
      );

      config.modResults.contents = `${leading}${anchoredScript}${trailing}`;
    } else {
      config.modResults.contents = `${config.modResults.contents.trimEnd()}\n\n${anchoredScript}\n`;
    }

    return config;
  });

  return config;
};

interface DoubloonProps {
  /**
   * The path to the working directory for the web project. The
   * `webBuildCommands` are run from here. If specified as a relative path, it
   * is resolved relative to the Expo project root (i.e. the directory that
   * holds `app.json`). Can be an absolute path.
   *
   * @example "../apps/web"
   * @example "/Users/jamie/my-web-app"
   */
  webWorkingDirectory: string;

  /**
   * The command to build the web app. Can be an empty string if your web app
   * has no build step.
   *
   * By default, we essentially call `node --run build`, with some subtlety in
   * order to get the path to `node` safely:
   *
   * - When targeting Apple platforms (iOS, tvOS, macOS, etc.), the command runs
   * in an Xcode build phase shell script which sources environment variables
   * from `ios/.xcode.env.local`. It defaults to `'"$NODE_BINARY" --run build'`.
   * - When targeting Android or Windows, the command runs as a child process of
   * the shell that launched `expo prebuild`, and inherits environment variables
   * from that shell. The command defaults to
   * `"\"${process.argv[0]}\" --run build"`, so it uses whichever instance of
   * Node.js launched the app.
   *
   * You can override the build commands if you wish:
   * @example { ios: "", android: "", macos: "", windows: "" }
   * @example { ios: "\"$NODE_BINARY\" --run build", android: "/usr/local/bin/node --run build" }
   */
  webBuildCommands?: {
    [platform: string]: string | Array<string>;
  };

  /**
   * @example "/Users/jamie/my-web-app/dist"
   */
  webOutputDir: string;

  /**
   * The directory to copy the contents of webOutputDir into. Directories with
   * slashes will be interpreted as a nested path.
   *
   * - In debug mode, this may affect the dev server URL the app should request.
   * - In release mode, this affects the file path the URL should load the
   * bundled app from.
   *
   * @default "web"
   * @example "nested/path/to/web"
   */
  bundleDirName?: string;
}

function assertValidProps(obj: unknown): asserts obj is DoubloonProps {
  if (typeof obj !== "object" || obj === null) {
    throw new Error("[Doubloon] Expected to be passed a props object.");
  }

  const { webOutputDir, webWorkingDirectory, webBuildCommands, bundleDirName } =
    obj as DoubloonProps;
  if (typeof webOutputDir !== "string") {
    throw new Error(`[Doubloon] Expected "webOutputDir" prop to be provided.`);
  }

  if (typeof webWorkingDirectory !== "string") {
    throw new Error(
      `[Doubloon] Expected "webWorkingDirectory" prop to be provided.`
    );
  }

  if (bundleDirName && typeof bundleDirName !== "string") {
    throw new Error(
      `[Doubloon] Expected "bundleDirName" prop to be a string, if provided.`
    );
  }

  if (webBuildCommands) {
    if (typeof webBuildCommands !== "object" || webBuildCommands === null) {
      throw new Error(
        `[Doubloon] Expected "webBuildCommands" to be an object.`
      );
    }

    const supportedPlatforms = new Set([
      "ios",
      "macos",
      "tvos",
      "android",
      "windows",
    ]);
    for (const [key, value] of Object.entries(webBuildCommands)) {
      if (!supportedPlatforms.has(key)) {
        throw new Error(
          `[Doubloon] Got unsupported platform "${key}" in "webBuildCommands". Please specify only those within: ${[
            ...supportedPlatforms,
          ]}`
        );
      }

      if (Array.isArray(value)) {
        for (const subvalue of value) {
          if (typeof subvalue !== "string") {
            throw new Error(
              `[Doubloon] Got unsupported value in "webBuildCommands" for key "${key}". For each value, please specify either a string or an array of strings.`
            );
          }
        }
        continue;
      }

      if (typeof value !== "string") {
        throw new Error(
          `[Doubloon] Got unsupported value in "webBuildCommands" for key "${key}". For each value, please specify either a string or an array of strings.`
        );
      }
    }
  }
}

// TODO: On Apple platforms, we're currently building and copying in the same
// build phase. We could simplify things by doing a child process build on all
// platforms and just using a build phase to copy the build into the bundle.
// FIXME: Handle multiple platforms performing a release build at once.
const xcodeBuildCommand = `"$NODE_BINARY" --run build`;
const childProcessBuildCommand = `\"${process.argv[0]}\" --run build`;
const defaultWebBuildCommands = {
  ios: xcodeBuildCommand,
  macos: xcodeBuildCommand,
  tvos: xcodeBuildCommand,
  windows: childProcessBuildCommand,
  android: ["node", "--run", "build"],
};

function makeGradleScript({
  webWorkingDirectory,
  webBuildCommands,
  webOutputDir,
  bundleDirName = "web",
}: DoubloonProps) {
  webBuildCommands = {
    ...defaultWebBuildCommands,
    ...webBuildCommands,
  };

  const webBuildCommand = webBuildCommands.android;
  if (!Array.isArray(webBuildCommand)) {
    throw new Error(
      `[Doubloon] Please provide webBuildCommands.android as an array of strings, rather than a string (only non-Android platforms support both strings and arrays of strings).`
    );
  }

  const bundleDirNameNormalized = path.normalize(bundleDirName);

  return `
tasks.register("doubloonBundleWebApp", Exec) {
    workingDir = file(["node", "--print", "require('node:path').resolve('$projectRoot', '${webWorkingDirectory}')"].execute(null, rootDir).text.trim())
    commandLine = ${JSON.stringify(webBuildCommand)}
    doFirst {
        println("[Doubloon] Building the web app...")
    }
    doLast {
        println("[Doubloon] ... Built the web app.")
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

    task.dependsOn("doubloonBundleWebApp");

    task.doLast {
        println("[Doubloon] Copying the web app build into the app bundle...");

        copy {
            from(["node", "--print", "require('node:path').resolve('$projectRoot', '${webOutputDir}')"].execute(null, rootDir).text.trim());
            into("$rootDir/app/src/main/assets/${bundleDirNameNormalized}");
        }

        println("[Doubloon] ... Copied the web app build into the app bundle.");
    }
}
`.trim();
}

function makeXcodeShellScript(
  platform: ModPlatform,
  {
    webWorkingDirectory,
    webBuildCommands,
    webOutputDir,
    bundleDirName = "web",
  }: DoubloonProps
) {
  webBuildCommands = {
    ...defaultWebBuildCommands,
    ...webBuildCommands,
  };
  const webBuildCommand = webBuildCommands[platform];
  if (typeof webBuildCommand === "undefined") {
    throw new Error(`Unrecognised Apple platform "${platform}"`);
  }
  const webBuildCommandNormalized = Array.isArray(webBuildCommand)
    ? webBuildCommand.join(" ")
    : webBuildCommand;

  const bundleDirNameNormalized = path.normalize(bundleDirName);

  return `
set -x -e

if [[ "$CONFIGURATION" = *Debug* ]]; then
  exit 0
fi

if [[ -f "$PODS_ROOT/../.xcode.env" ]]; then
  source "$PODS_ROOT/../.xcode.env"
fi
if [[ -f "$PODS_ROOT/../.xcode.env.local" ]]; then
  source "$PODS_ROOT/../.xcode.env.local"
fi

# The project root by default is one level up from the ios directory
export PROJECT_ROOT="$PROJECT_DIR"/..

echo "[Doubloon] Building the web app..."

# With reference to node_modules/react-native/scripts/react-native-xcode.sh
export WEB_CWD=$("$NODE_BINARY" --print "require('node:path').resolve('$PROJECT_ROOT', '${webWorkingDirectory}')")
echo "[Doubloon] Resolved WEB_CWD as: \"$WEB_CWD\""
export DEST=$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH

pushd "$WEB_CWD"
${webBuildCommandNormalized}
popd

echo "[Doubloon] ... Built the web app."

echo "[Doubloon] Copying the web app build into the app bundle..."
export WEB_DIST=$("$NODE_BINARY" --print "require('node:path').resolve('$PROJECT_ROOT', '${webOutputDir}')")
echo "[Doubloon] Resolved WEB_DIST as: \"$WEB_DIST\""
mkdir -vp "$DEST/${bundleDirNameNormalized}"
cp -r "$WEB_DIST/" "$DEST/${bundleDirNameNormalized}"
echo "[Doubloon] ... Copied the web app build into the app bundle."
`.trim();
}

export default withDoubloon;

/**
 * Removes all build phases matching the given name, then adds a new one in
 * their place.
 * @see https://github.com/apache/cordova-node-xcode/blob/master/lib/pbxProject.js#L872
 */
function ensureBuildPhase({
  project,
  buildPhaseName,
  buildPhaseArgs,
  target = project.getFirstTarget().uuid,
}: {
  /** The Xcode project to modify. */
  project: XcodeProject;
  /** The name of the build build phase to modify. */
  buildPhaseName: string;
  buildPhaseArgs:
    | {
        type: "PBXCopyFilesBuildPhase";
        /** The array of input files. */
        inputFiles?: Array<string>;
        destination?: string;
      }
    | {
        type: "PBXShellScriptBuildPhase";
        /** The array of input files. */
        inputFiles?: Array<string>;
        /**
         * The path to the shell.
         * @default "/bin/sh"
         */
        shellPath?: string;
        /**
         * The shell script to run.
         * @example 'echo "hello world!"'
         */
        shellScript: string;
      };
  /**
   * The UUID of the project target. Defaults to the first target in the
   * project (which is usually what you want). Not to be confused with the build
   * target (which is more likely to vary).
   */
  target?: string;
}) {
  switch (buildPhaseArgs.type) {
    case "PBXCopyFilesBuildPhase": {
      const { inputFiles = [], destination } = buildPhaseArgs;
      // TODO: remove any input files previously referenced by the build script.
      removeBuildPhase({
        project,
        buildPhaseName,
        buildPhaseType: buildPhaseArgs.type,
      });
      project.addBuildPhase(
        inputFiles,
        buildPhaseArgs.type,
        buildPhaseName,
        target,
        // For usage, see:
        // https://github.com/apache/cordova-node-xcode/blob/c491d3a26f11ae63c566ae50fbd44e844f448724/test/addBuildPhase.js#L125
        destination
      );
      break;
    }
    case "PBXShellScriptBuildPhase": {
      const {
        shellPath = "/bin/sh",
        inputFiles = [],
        shellScript,
      } = buildPhaseArgs;
      // TODO: remove any input files previously referenced by the build script.
      removeBuildPhase({
        project,
        buildPhaseName,
        buildPhaseType: buildPhaseArgs.type,
      });
      project.addBuildPhase(
        inputFiles,
        buildPhaseArgs.type,
        buildPhaseName,
        target,
        // The shell script will get sanitised for us:
        // https://github.com/apache/cordova-node-xcode/blob/c491d3a26f11ae63c566ae50fbd44e844f448724/lib/pbxProject.js#L1645
        { shellPath, shellScript }
      );
      break;
    }
  }
}

/**
 * Reverses the operation peformed by pbxProject.prototype.addBuildPhase().
 * @see https://github.com/apache/cordova-node-xcode/blob/master/lib/pbxProject.js#L872
 */
function removeBuildPhase({
  project,
  buildPhaseName,
  buildPhaseType,
}: {
  /** The Xcode project to modify. */
  project: XcodeProject;
  /** The type of build phase. */
  buildPhaseType: "PBXCopyFilesBuildPhase" | "PBXShellScriptBuildPhase";
  /** The name of the build build phase to remove. */
  buildPhaseName: string;
}) {
  for (const [_uuid, nativeTarget] of Object.entries(
    project.pbxNativeTargetSection()
  )) {
    if (
      !isPBXNativeTarget(nativeTarget) ||
      nativeTarget.productType !== '"com.apple.product-type.application"'
    ) {
      continue;
    }

    nativeTarget.buildPhases = nativeTarget.buildPhases.filter(
      ({ comment }) => comment !== buildPhaseName
    );
  }

  for (const [uuid, nativeTarget] of Object.entries(
    project.hash.project.objects.PBXShellScriptBuildPhase
  )) {
    if (uuid.endsWith("_comment")) {
      if (nativeTarget !== buildPhaseName) {
        continue;
      }
    } else if (isPBXShellScriptBuildPhase(nativeTarget)) {
      // https://github.com/apache/cordova-node-xcode/blob/c491d3a26f11ae63c566ae50fbd44e844f448724/lib/pbxProject.js#L1641
      if (nativeTarget.name !== `"${buildPhaseName}"`) {
        continue;
      }
    } else {
      continue;
    }

    delete project.hash.project.objects[buildPhaseType][uuid];
  }
}

function isPBXNativeTarget(obj: unknown): obj is PBXNativeTarget {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  return (obj as PBXNativeTarget).isa === "PBXNativeTarget";
}
function isPBXShellScriptBuildPhase(
  obj: unknown
): obj is PBXShellScriptBuildPhase {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  return (obj as PBXShellScriptBuildPhase).isa === "PBXShellScriptBuildPhase";
}

// Unfortunately @expo/cli/ts-declarations does not distribute their typings so
// we have to redefine them ourselves.
interface PBXNativeTarget {
  isa: "PBXNativeTarget";
  /** @example '13B07F931A680F5B00A75B9A' */
  buildConfigurationList: string;
  /** @example 'Build configuration list for PBXNativeTarget "Doubloon"' */
  buildConfigurationList_comment: string;
  buildPhases: Array<{ value: string; comment: string }>;
  buildRules: Array<unknown>;
  dependencies: Array<unknown>;
  /** @example "Doubloon" */
  name: string;
  /** @example "Doubloon" */
  productName: string;
  /** @example "13B07F961A680F5B00A75B9A" */
  productReference: string;
  /** @example "Doubloon.app" */
  productReference_comment: string;
  /** @example '"com.apple.product-type.application"' */
  productType: string;
}

interface PBXShellScriptBuildPhase {
  isa: "PBXShellScriptBuildPhase";
  /** @example 2147483647 */
  buildActionMask: number;
  /** @example main.m */
  files: Array<string>;
  /** @example 0 */
  runOnlyForDeploymentPostprocessing: number;
  /** @example '"Run a script"' */
  name: string;
  inputPaths: Array<unknown>;
  outputPaths: Array<unknown>;
  /** @example "/bin/sh" */
  shellPath: string;
  /** @example '"echo \\"hello world!\\""' */
  shellScript: string;
}
