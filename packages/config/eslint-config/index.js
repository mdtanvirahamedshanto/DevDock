module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "turbo"],
  env: {
    node: true,
    browser: true,
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react-hooks"],
  rules: {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error"
  },
  ignorePatterns: [
    "**/*.config.js",
    "**/*.config.cjs",
    "dist",
    "pnpm-lock.yaml",
  ],
};
