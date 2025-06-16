// A Babel config just for Jest. Avoiding calling it babel.config.js to make it
// clear that it has nothing to do with the Electron project.
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-typescript",
  ],
};
