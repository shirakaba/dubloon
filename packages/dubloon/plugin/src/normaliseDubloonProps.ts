import type { DubloonProps } from "./DubloonProps";
import { defaultWebBuildCommands } from "./withDubloonCommon";

export function normalizeDubloonProps({ config }: DubloonProps) {
  // TODO: rename "webWorkingDir" to "cwd"?
  const webWorkingDir = config.webWorkingDir;
  const webOutputDir = config.webOutputDir;
  const bundleDirName = config.bundleDirName ?? "web";
  const webBuildCommands = {
    ...defaultWebBuildCommands,
    ...config.webBuildCommands,
  };

  return {
    webWorkingDir,
    webOutputDir,
    bundleDirName,
    webBuildCommands,
  };
}
