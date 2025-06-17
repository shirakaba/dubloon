import type { Configuration as WebpackConfiguration } from "webpack";

// From https://github.com/webpack/webpack-cli/blob/master/packages/webpack-cli/src/types.ts
// See the Webpack CLI's loading algorithm:
// https://github.com/webpack/webpack-cli/blob/3a37ec948585a49e59f5082a0238d795640bd636/packages/webpack-cli/src/webpack-cli.ts#L1832
export type LoadableWebpackConfiguration = PotentialPromise<
  WebpackConfiguration | CallableWebpackConfiguration
>;
type PotentialPromise<T> = T | Promise<T>;
type CallableWebpackConfiguration = (
  env: Env | undefined,
  argv: Argv
) => WebpackConfiguration;
interface Argv extends Record<string, any> {
  env?: Env;
}

interface Env {
  WEBPACK_BUNDLE?: boolean;
  WEBPACK_BUILD?: boolean;
  WEBPACK_WATCH?: boolean;
  WEBPACK_SERVE?: boolean;
  WEBPACK_PACKAGE?: string;
  WEBPACK_DEV_SERVER_PACKAGE?: string;
}
