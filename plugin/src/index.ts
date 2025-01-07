import { ConfigPlugin, withXcodeProject } from "expo/config-plugins";

const withDubloon: ConfigPlugin = (config) => {
  withXcodeProject(config, {});
  console.log("my custom plugin");
  return config;
};

export default withDubloon;
