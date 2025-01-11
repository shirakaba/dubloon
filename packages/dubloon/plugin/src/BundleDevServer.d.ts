declare module "@expo/cli/build/src/start/server/BundlerDevServer" {
  class BundlerDevServer {
    constructor(
      /** Project root folder. */
      projectRoot: string,

      /** A mapping of bundlers to platforms. */
      platformBundlers: { [platform: string]: "metro" | "webpack" },

      /** Advanced options */
      options?: {
        /**
         * The instance of DevToolsPluginManager
         * @default new DevToolsPluginManager(projectRoot)
         */
        devToolsPluginManager?: import("@expo/cli/build/src/start/server/DevToolsPluginManager").DevToolsPluginManagerType;
        // TODO: Replace with custom scheme maybe...
        isDevClient?: boolean;
      }
    );

    getTunnelUrl(): string | null;

    /**
     *
     * @see https://github.com/expo/expo/blob/a1a54e2f575ec9817923b9a3045e92813db28c00/packages/%40expo/cli/src/start/server/BundlerDevServer.ts#L348
     */
    getNativeRuntimeUrl(opts: Partial<CreateURLOptions> = {}): string;

    /**
     *
     * @see https://github.com/expo/expo/blob/a1a54e2f575ec9817923b9a3045e92813db28c00/packages/%40expo/cli/src/start/server/BundlerDevServer.ts#L366
     */
    getDevServerUrl(options: { hostType?: "localhost" } = {}): string | null;
  }
}

declare module "@expo/cli/build/src/start/server/DevToolsPluginManager" {
  class DevToolsPluginManager {
    constructor(projectRoot: string);
  }
  // Workaround to refer to DevToolsPluginManager which doesn't seem to be
  // resolving as a default export
  export type DevToolsPluginManagerType = DevToolsPluginManager;

  const clazz: typeof DevToolsPluginManager;
  export = clazz;
}
