import { nextJsConfig } from "@repo/eslint-config/next-js";
import { globalIgnores } from "eslint/config";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  // Playwright artifacts, regenerated on every run.
  globalIgnores(["playwright-report/**", "test-results/**", "blob-report/**"]),
];
