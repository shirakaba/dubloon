import type { ExpoConfig } from "@expo/config-types";
import {
  type ExportedConfig,
  IOSConfig,
  withAppBuildGradle,
  withXcodeProject,
} from "@expo/config-plugins";
import { ensureBuildPhase, makeXcodeShellScript } from "./withDubloonIos.ts";
import { assertValidProps } from "./withDubloonCommon.ts";
import { makeGradleScript } from "./withDubloonAndroid.ts";

export const withDubloon = (
  config: ExpoConfig,
  props: unknown
): ExportedConfig => {
  assertValidProps(props);

  config = withXcodeProject(config, async (config) => {
    const project = IOSConfig.XcodeUtils.getPbxproj(
      config.modRequest.projectRoot
    );

    ensureBuildPhase({
      project,
      buildPhaseName: "[Dubloon] Bundle and copy web app",
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
        `[Dubloon] Could not modify build.gradle as the file's language is "${config.modResults.language}", yet we only support Groovy.`
      );
    }

    const startAnchor = "// == Dubloon config plugin START ==";
    const endAnchor = "// == Dubloon config plugin END ==";
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
