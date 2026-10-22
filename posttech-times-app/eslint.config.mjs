import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "android/**",
    "ios/**",
    "node_modules/**",
    "next-env.d.ts",
    // Background Runner의 별도 JS 환경에서 도는 파일(CapacitorKV 등 전역 사용).
    "public/runners/**",
  ]),
]);

export default eslintConfig;
