// https://stackoverflow.com/a/78907287/5951226
// import type { UserConfigExport } from "vite" with { "resolution-mode": "import" };
// import type { LoadableWebpackConfiguration } from "./webpack.types";
import { z } from "zod/v4-mini";

/**
 * `DubloonProps` are the options that you can specify in your `app.json` to
 * configure the Dubloon Expo
 * [Config Plugin](https://docs.expo.dev/config-plugins/introduction/).
 *
 * @example
 * Where `DubloonProps` fits into your `app.json`:
 * ```json
 * {
 *   "expo": {
 *     // ... omitted...
 *     "plugins": [
 *       [
 *         "dubloon",
 *         // ⬇ These options conform to the DubloonProps interface.
 *         {
 *           "webWorkingDir": "../path/to/web/app",
 *           "webOutputDir": "../path/to/web/app/build"
 *         }
 *       ]
 *     ]
 *   }
 * }
 * ```
 *
 * @example
 * A minimal config:
 * ```json
 * {
 *   "webWorkingDir": "../path/to/web/app",
 *   "webOutputDir": "../path/to/web/app/build"
 * }
 * ```
 *
 * @example
 * An advanced config:
 * ```json
 * {
 *   "webWorkingDir": "../path/to/web/app",
 *   "webOutputDir": "../path/to/web/app/build",
 *   "webBuildCommands": {
 *     ios: "\"$NODE_BINARY\" --run build",
 *     android: "/usr/local/bin/node --run build"
 *   },
 *   "bundleDirName": "web"
 * }
 * ```
 */
export interface DubloonProps {
  config: { type: "vite" | "webpack"; path: string };
  // TODO: rspack, rsbuild, etc.

  // /**
  //  * The path to the working directory for the web project. The web app is built
  //  * from here, using the default command (essentially `node --run build`) or a
  //  * custom one specified via the `webBuildCommands` option.
  //  *
  //  * Both absolute and relative paths are supported. If specified as a relative
  //  * path, it is resolved relative to the Expo project root (i.e. the directory
  //  * that holds `app.json`).
  //  *
  //  * It is recommended to place the web app side-by-side with the Expo app and
  //  * refer to the directory via a relative path. This makes it
  //  * environment-agnostic.
  //  *
  //  * **Examples**
  //  * - `"../web"`
  //  * - `"/Users/jamie/my-web-app"`
  //  */
  // webWorkingDir: string;

  // /**
  //  * The command to build the web app. Can be an empty string if your web app
  //  * has no build step.
  //  *
  //  * By default, we essentially call `node --run build`, with some subtlety in
  //  * order to get the path to `node` safely:
  //  *
  //  * - When targeting Apple platforms (iOS, tvOS, macOS, etc.), the command runs
  //  * in an Xcode build phase shell script which sources environment variables
  //  * from `ios/.xcode.env.local`. It defaults to `'"$NODE_BINARY" --run build'`.
  //  * - When targeting Android or Windows, the command runs using the user's
  //  * default shell. It defaults to `node --run build"`.
  //  *
  //  * You can override the build commands if you wish:
  //  *
  //  * **Examples**
  //  * - Making the build commands no-op when the web app has no build step:
  //  *   ```json
  //  *   { ios: "", android: "" }
  //  *   ```
  //  *
  //  * - Specifying explicit build commands:
  //  *   ```json
  //  *   {
  //  *     ios: "\"$NODE_BINARY\" --run bundle",
  //  *     android: "node --run bundle"
  //  *   }
  //  *   ```
  //  *
  //  * - 🏗️ Configuring out-of-tree platforms (blocked on Expo CLI supporting
  //  *   Prebuild for them, but will work one day):
  //  *   ```json
  //  *   {
  //  *     macos: "\"$NODE_BINARY\" --run bundle",
  //  *     windows: "node --run bundle"
  //  *     // The missing "ios" and "android" platforms will fall back to the
  //  *     // default commands if your project includes those platforms.
  //  *   }
  //  *   ```
  //  */
  // webBuildCommands?: {
  //   [platform: string]: string | Array<string>;
  // };

  // /**
  //  * The path that the web app gets output to once built. During release builds,
  //  * Dubloon will build the app and then copy it from here into your Expo app.
  //  *
  //  * Both absolute and relative paths are supported. If specified as a relative
  //  * path, it is resolved relative to the Expo project root (i.e. the directory
  //  * that holds `app.json`).
  //  *
  //  * It is recommended to place the web app side-by-side with the Expo app and
  //  * refer to the directory via a relative path. This makes it
  //  * environment-agnostic.
  //  *
  //  * **Examples**
  //  * - `"my-web-app/dist"`
  //  * - `"../web/dist"`
  //  * - `"/Users/jamie/my-web-app/dist"`
  //  */
  // webOutputDir: string;

  // /**
  //  * The subdirectory, within the app bundle's assets folder, to copy the
  //  * contents of `webOutputDir` into. A `bundleDirName` with slashes will be
  //  * interpreted as a nested path.
  //  *
  //  * - In debug mode, this has no effect.
  //  * - In release mode, this affects the file path the URL should load the
  //  * bundled app from.
  //  *
  //  * **Default**
  //  * - `"web"`
  //  *
  //  * **Examples**
  //  * - `"www"`
  //  * - `"nested/path/to/web"`
  //  */
  // bundleDirName?: string;
}

export const DubloonPropsStruct = z.object({
  config: z.object({
    type: z.union([z.literal("vite"), z.literal("webpack")]),
    path: z.string(),
  }),
}) satisfies z.ZodMiniType<DubloonProps>;
