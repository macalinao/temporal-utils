import { configs } from "@macalinao/eslint-config";

export default [
  ...configs.base,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
