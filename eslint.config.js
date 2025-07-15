const globals = require("globals");
const pluginJs = require("@eslint/js");
const pluginReact = require("eslint-plugin-react");
const pluginNext = require("@next/eslint-plugin-next");

module.exports = [
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjs,ts,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react: pluginReact,
      "@next/next": pluginNext,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      ...pluginNext.configs.recommended.rules,
    },
  },
];
