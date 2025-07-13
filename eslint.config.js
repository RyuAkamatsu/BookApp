import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import typescript from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import airbnb from "eslint-config-airbnb";
import reactNative from "eslint-plugin-react-native";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}", "!node_modules/**"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        project: "./tsconfig.json"
      },
      globals: {
        __DEV__: true
      }
    },
    plugins: {
      react,
      "@typescript-eslint": typescript,
      "react-native": reactNative,
      "react-hooks": reactHooks
    },
    rules: {
      "linebreak-style": "off",
      "padded-blocks": "off",
      "indent": ["error", 4, { "SwitchCase": 1 }],
      "comma-dangle": ["error", "only-multiline"],
      "no-multiple-empty-lines": ["error", { "max": 2, "maxBOF": 0, "maxEOF": 1 }],
      "global-require": "off",
      "import/no-unresolved": "off",
      "key-spacing": ["error", { "beforeColon": false, "mode": "minimum", "align": "colon" }],
      "arrow-parens": ["error", "as-needed"],
      "no-trailing-spaces": ["error", { "skipBlankLines": true }],
      "max-len": ["error", { "code": 150 }],
      "no-underscore-dangle": "off",
      "no-restricted-syntax": ["error",
        {
          "selector": "ForInStatement",
          "message": "for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array."
        },
        {
          "selector": "LabeledStatement",
          "message": "Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand."
        },
        {
          "selector": "WithStatement",
          "message": "`with` is disallowed in strict mode because it makes code impossible to predict and optimize."
        }
      ],
      "no-plusplus": "off",
      "operator-linebreak": "off",
      "no-bitwise": ["error", { "int32Hint": true }],
      "no-param-reassign": "off",
      "no-await-in-loop": "off",
      "no-continue": "off",
      "object-curly-newline": ["error", { "multiline": true }],
      "radix": ["error", "as-needed"],
      "no-unused-expressions": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "args": "none" }],
      "no-use-before-define": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "no-console": "off",
      "import/extensions": "off",
      "react/jsx-one-expression-per-line": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-indent": ["error", 4],
      "react/jsx-indent-props": ["error", "first"],
      "react/jsx-curly-spacing": ["error", { "when": "always", "spacing": { "objectLiterals": "never" } }],
      "react/destructuring-assignment": "off",
      "react/prop-types": "off",
      "react/sort-comp": "off",
      "react/style-prop-object": "off",
      "react/jsx-no-bind": "off",
      "react/jsx-filename-extension": [2, { "extensions": [".js", ".jsx", ".ts", ".tsx"] }],
      "react/no-unstable-nested-components": "warn",
      "react/no-array-index-key": "warn",
      "jsx-a11y/label-has-associated-control": ["error", { "assert": "either" }],
      "react-native/no-unused-styles": "error",
      "react-native/split-platform-components": "error",
      "react-native/no-inline-styles": "warn",
      "react-native/no-color-literals": "off",
      "react-native/no-raw-text": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/exhaustive-deps": "warn"
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  }
]; 