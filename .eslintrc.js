module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb-base',
    'airbnb-typescript',
    'plugin:eslint-comments/recommended',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules/', '.eslintrc.js'],
  parser: '@typescript-eslint/parser',
  plugins: ['prefer-arrow-functions'],
  rules: {
    'prettier/prettier': ['off', { singleQuote: true }],
    "import/no-extraneous-dependencies": "off",
    'import/extensions': "off",
    "no-await-in-loop": "off",
    "import/no-cycle": "off",
    "@typescript-eslint/no-throw-literal": "off",
    "import/extensions": "off",
    "no-plusplus": "off",
    "no-param-reassign": "off",
    "prefer-template": "off",
    '@typescript-eslint/no-explicit-any': 0,
    'no-console': 'off',
    'import/prefer-default-export': 'off',
    'global-require': 'off',
    '@typescript-eslint/no-shadow': 'off',
    'eslint-comments/no-unused-disable': 'warn',
    'max-len': 'off',
    "consistent-return": "off",
    "no-restricted-syntax" : "off",
    "class-methods-use-this": "off",
    // -- see: https://github.com/prettier/eslint-plugin-prettier -- //
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off",
    "prefer-destructuring": "off",
    // ------------------------------------------------------------- //
    'prefer-arrow-functions/prefer-arrow-functions': [
      'warn',
      {
        'allowNamedFunctions': false,
        'classPropertiesAllowed': false,
        'disallowPrototype': false,
        'returnStyle': 'unchanged',
        'singleReturnOnly': false,
      },
    ],
    // ------------ jest ------------ //
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/prefer-to-have-length": "warn",
    "jest/valid-expect": "error"
  }
}
