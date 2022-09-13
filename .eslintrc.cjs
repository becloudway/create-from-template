module.exports = {
  root: true,
  env: { node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: `${__dirname}/tsconfig-eslint.json`,
  },
  plugins: ['@typescript-eslint', 'prettier', 'jest'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'airbnb-base', 'airbnb-typescript/base', 'plugin:prettier/recommended', 'plugin:jest/recommended'],
  rules: {
    'prettier/prettier': 'error',
    'import/prefer-default-export': 'off',
    semi: [2, 'always'],
  },
};
