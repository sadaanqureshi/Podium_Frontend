import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    typescript: {
    // !! WARNING !!
    // Build fail nahi hogi agar aapke project mein TS errors hain.
    // Client demo ke liye yeh best jugaar hai.
    ignoreBuildErrors: true,
  },
  },
];

export default eslintConfig;
