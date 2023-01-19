module.exports = {
  root: true,
  env: { node: true },
  plugins: ['prettier', 'jest'],
  extends: ['eslint:recommended', 'airbnb-base', 'plugin:prettier/recommended', 'plugin:jest/recommended'],
  rules: {
    'prettier/prettier': 'error',
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    semi: [2, 'always'],
  },
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      env: { node: true },
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: `${__dirname}/tsconfig-eslint.json`,
      },
      plugins: ['@typescript-eslint', 'prettier', 'jest'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'airbnb-base',
        'airbnb-typescript/base',
        'plugin:prettier/recommended',
        'plugin:jest/recommended',
      ],
      rules: {
        'prettier/prettier': 'error',
        'import/prefer-default-export': 'off',
        'class-methods-use-this': 'off',
        semi: [2, 'always'],
      },
    },
  ],
};
