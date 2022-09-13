module.exports = {
  root: true,
  env: { node: true },
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'airbnb-base', 'plugin:prettier/recommended'],
  rules: {
    'prettier/prettier': 'error',
    'import/prefer-default-export': 'off',
    semi: [2, 'always'],
  },
};
