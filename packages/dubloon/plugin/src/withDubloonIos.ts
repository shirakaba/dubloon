import path from "node:path";
import type { ModPlatform, XcodeProject } from "expo/config-plugins";
import type { DubloonProps } from "./DubloonProps.types";
import { defaultWebBuildCommands } from "./withDubloonCommon";

export function makeXcodeShellScript(
  platform: ModPlatform,
  {
    webWorkingDir,
    webBuildCommands,
    webOutputDir,
    bundleDirName = "web",
  }: DubloonProps
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

echo "[Dubloon] Building the web app..."

# With reference to node_modules/react-native/scripts/react-native-xcode.sh
export WEB_CWD=$("$NODE_BINARY" --print "require('node:path').resolve('$PROJECT_ROOT', '${webWorkingDir}')")
echo "[Dubloon] Resolved WEB_CWD as: \"$WEB_CWD\""
export DEST=$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH

pushd "$WEB_CWD"
${webBuildCommandNormalized}
popd

echo "[Dubloon] ... Built the web app."

echo "[Dubloon] Copying the web app build into the app bundle..."
export WEB_DIST=$("$NODE_BINARY" --print "require('node:path').resolve('$PROJECT_ROOT', '${webOutputDir}')")
echo "[Dubloon] Resolved WEB_DIST as: \"$WEB_DIST\""
mkdir -vp "$DEST/${bundleDirNameNormalized}"
cp -r "$WEB_DIST/" "$DEST/${bundleDirNameNormalized}"
echo "[Dubloon] ... Copied the web app build into the app bundle."
`.trim();
}

/**
 * Removes all build phases matching the given name, then adds a new one in
 * their place.
 * @see https://github.com/apache/cordova-node-xcode/blob/master/lib/pbxProject.js#L872
 */
export function ensureBuildPhase({
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
  /** @example 'Build configuration list for PBXNativeTarget "Dubloon"' */
  buildConfigurationList_comment: string;
  buildPhases: Array<{ value: string; comment: string }>;
  buildRules: Array<unknown>;
  dependencies: Array<unknown>;
  /** @example "Dubloon" */
  name: string;
  /** @example "Dubloon" */
  productName: string;
  /** @example "13B07F961A680F5B00A75B9A" */
  productReference: string;
  /** @example "Dubloon.app" */
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
