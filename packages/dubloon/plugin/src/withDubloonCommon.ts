import { type DubloonProps, DubloonPropsStruct } from "./DubloonProps";

export function assertValidProps(obj: unknown): asserts obj is DubloonProps {
  DubloonPropsStruct.parse(obj);
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
