/// <reference path="../ts-declarations/xcode/index.d.ts" />

import path from "node:path";
import type { ExpoConfig } from "@expo/config-types";
import type { XcodeProject } from "@expo/config-plugins";

import { withDubloon } from "./withDubloon";
import type { DubloonProps } from "./DubloonProps";
import { expectToBeNonNullable } from "../../test/expect";

const workspace = path.resolve(__dirname, "../..");
const monorepoRoot = path.resolve(workspace, "../..");
const exampleApp = path.resolve(monorepoRoot, "apps/example");

describe("withDubloon", () => {
  it("For iOS, adds an Xcode build step", async () => {
    const { mods } = withDubloon(expoConfig, expoConfig.plugins?.at(0)?.at(1));
    expectToBeNonNullable(mods);

    const { ios } = mods;
    expectToBeNonNullable(ios);

    const { xcodeproj } = ios;
    expectToBeNonNullable(xcodeproj);

    const result = await xcodeproj({
      // It'll get filled in for us anyway.
      modResults: {} as XcodeProject,
      modRequest: {
        projectRoot: exampleApp,
        // Yeah, we'll just use the example app as a convenient fixture 🤷‍♂️
        platformProjectRoot: path.resolve(exampleApp, "ios"),
        modName: "dubloon",
        platform: "ios",
        introspect: false,
      },
      modRawConfig: expoConfig,
      name: expoConfig.name,
      slug: expoConfig.slug,
    });

    const buildPhase = Object.entries(
      result.modResults.hash.project.objects.PBXShellScriptBuildPhase
    ).find(([, { name }]) => name === '"[Dubloon] Bundle and copy web app"');
    expectToBeNonNullable(buildPhase);
    const [hash] = buildPhase;

    const comment = Object.entries(
      result.modResults.hash.project.objects.PBXShellScriptBuildPhase
    ).find(([key]) => key === `${hash}_comment`);
    expectToBeNonNullable(comment);
    const [, value] = comment;
    expect(value).toBe("[Dubloon] Bundle and copy web app");
  });

  it("For Android, inserts a Gradle build step", async () => {
    const { mods } = withDubloon(expoConfig, expoConfig.plugins?.at(0)?.at(1));
    expectToBeNonNullable(mods);

    const { android } = mods;
    expectToBeNonNullable(android);

    const { appBuildGradle } = android;
    expectToBeNonNullable(appBuildGradle);

    // TODO: Assertions
  });
});

const expoConfig: ExpoConfig = {
  name: "DubloonExample",
  slug: "DubloonExample",
  plugins: [
    [
      "dubloon",
      {
        config: {
          type: "vite",
          path: "../web",
        },
      } satisfies DubloonProps,
    ],
  ],
};
