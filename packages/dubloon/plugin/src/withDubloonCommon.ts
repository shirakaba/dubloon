import type { DubloonProps } from "./DubloonProps.types";

export function assertValidProps(obj: unknown): asserts obj is DubloonProps {
  if (typeof obj !== "object" || obj === null) {
    throw new Error("[Dubloon] Expected to be passed a props object.");
  }

  const { webOutputDir, webWorkingDir, webBuildCommands, bundleDirName } =
    obj as DubloonProps;
  if (typeof webOutputDir !== "string") {
    throw new Error(`[Dubloon] Expected "webOutputDir" prop to be provided.`);
  }

  if (typeof webWorkingDir !== "string") {
    throw new Error(`[Dubloon] Expected "webWorkingDir" prop to be provided.`);
  }

  if (bundleDirName && typeof bundleDirName !== "string") {
    throw new Error(
      `[Dubloon] Expected "bundleDirName" prop to be a string, if provided.`
    );
  }

  if (webBuildCommands) {
    if (typeof webBuildCommands !== "object" || webBuildCommands === null) {
      throw new Error(`[Dubloon] Expected "webBuildCommands" to be an object.`);
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
          `[Dubloon] Got unsupported platform "${key}" in "webBuildCommands". Please specify only those within: ${[
            ...supportedPlatforms,
          ]}`
        );
      }

      if (Array.isArray(value)) {
        for (const subvalue of value) {
          if (typeof subvalue !== "string") {
            throw new Error(
              `[Dubloon] Got unsupported value in "webBuildCommands" for key "${key}". For each value, please specify either a string or an array of strings.`
            );
          }
        }
        continue;
      }

      if (typeof value !== "string") {
        throw new Error(
          `[Dubloon] Got unsupported value in "webBuildCommands" for key "${key}". For each value, please specify either a string or an array of strings.`
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

export const defaultWebBuildCommands = {
  ios: xcodeBuildCommand,
  macos: xcodeBuildCommand,
  tvos: xcodeBuildCommand,
  windows: childProcessBuildCommand,
  android: ["node", "--run", "build"],
};
