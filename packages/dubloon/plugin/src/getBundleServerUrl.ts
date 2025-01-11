import { BundlerDevServer } from "@expo/cli/build/src/start/server/BundlerDevServer";
import DevToolsPluginManager from "@expo/cli/build/src/start/server/DevToolsPluginManager";

// {
//   projectRoot: '/Users/jamie/Documents/git/Dubloon/apps/example',
//   platformBundlers: { ios: 'metro', android: 'metro', web: 'metro' },
//   options: {
//     devToolsPluginManager: DevToolsPluginManager {
//       projectRoot: '/Users/jamie/Documents/git/Dubloon/apps/example',
//       plugins: null
//     },
//     isDevClient: false
//   }
// }

const projectRoot = "/Users/jamie/Documents/git/Dubloon/apps/example";

const devToolsPluginManager = new DevToolsPluginManager(projectRoot);

const server = new BundlerDevServer(
  projectRoot,
  { ios: "metro", android: "metro", web: "metro" },
  { devToolsPluginManager }
);

console.log(server.getTunnelUrl());

// NSURL *bundleURL = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];
// weakSelf.bundleURL	NSURL *	"http://192.168.11.2:8081/.expo/.virtual-metro-entry.bundle?platform=ios&dev=true&lazy=true&minify=false&inlineSourceMap=false&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server&app=org.name.DubloonExample"

// RCTHostBundleURLProvider

// NSURL *bundleURL = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"hello"];
// "http://192.168.11.2:8081/hello.bundle?platform=ios&dev=true&lazy=true&minify=false&inlineSourceMap=false&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server&app=org.name.DubloonExample"
