export interface DoubloonProps {
  /**
   * The path to the working directory for the web project. The
   * `webBuildCommands` are run from here. If specified as a relative path, it
   * is resolved relative to the Expo project root (i.e. the directory that
   * holds `app.json`). Can be an absolute path.
   *
   * @example "../apps/web"
   * @example "/Users/jamie/my-web-app"
   */
  webWorkingDir: string;

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
   * The subdirectory, within the app bundle's assets folder, to copy the
   * contents of webOutputDir into. A subdirectory with slashes will be
   * interpreted as a nested path.
   *
   * - In debug mode, this has no effect.
   * - In release mode, this affects the file path the URL should load the
   * bundled app from.
   *
   * @default "web"
   * @example "nested/path/to/web"
   */
  bundleDirName?: string;
}
