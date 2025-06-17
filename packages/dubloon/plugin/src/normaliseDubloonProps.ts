import path from "node:path";
import type { ExportedConfigWithProps } from "@expo/config-plugins";
import type { DubloonProps } from "./DubloonProps";
import { defaultWebBuildCommands } from "./withDubloonCommon";

export function normalizeDubloonProps(
  { modRequest: { projectRoot } }: ExportedConfigWithProps,
  { config }: DubloonProps
) {
  // TODO: rename "webWorkingDir" to "cwd"?
  let webWorkingDir: string;
  let webOutputDir: string;
  let bundleDirName: string;
  const webBuildCommands = { ...defaultWebBuildCommands };

  switch (config.type) {
    case "custom": {
      webWorkingDir = config.webWorkingDir;
      webOutputDir = config.webOutputDir;
      bundleDirName = config.bundleDirName ?? "web";
      Object.assign(webBuildCommands, config.webBuildCommands);
      break;
    }
    case "vite":
    case "webpack": {
      // TODO: Warn if config.cwd or config.path is absolute?

      // Normalise the path.
      webWorkingDir = path.relative(
        projectRoot,
        path.resolve(projectRoot, config.cwd || config.path)
      );

      throw new Error("Not implemented");
    }
  }

  return {
    webWorkingDir,
    webOutputDir,
    bundleDirName,
    webBuildCommands,
  };
}
