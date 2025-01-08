// Reexport the native module. On web, it will be resolved to DoubloonModule.web.ts
// and on native platforms to DoubloonModule.ts
export { default } from './DoubloonModule';
export { default as DoubloonView } from './DoubloonView';
export * from  './Doubloon.types';
