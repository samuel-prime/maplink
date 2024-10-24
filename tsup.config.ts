import { defineConfig } from "tsup";

export default defineConfig({
  format: ["cjs", "esm"],
  entry: ["core", "modules", "utils", "index.ts"],
  dts: true,
  shims: true,
  clean: true,
  skipNodeModulesBundle: true,
});
