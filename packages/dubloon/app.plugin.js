import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { withDubloon } = require("./plugin/build/index.js");

export { withDubloon };
