module.exports = {
  extends: ['airbnb-base', '@open-wc/eslint-config', 'prettier', 'plugin:sonarjs/recommended'],
  plugins: ['lit', 'prettier', 'chai-friendly', 'sonarjs'],
  globals: {},
  parserOptions: {
    ecmaVersion: 'latest',
  },
  ignorePatterns: ['**/test-output/*', '**/build/*', '**/coverage/*'],
  rules: {
    // Tries to force static, static methods can't be overridden when extending class
    'class-methods-use-this': 0,
    'import/no-unresolved': 0,
    // reassigning CustomEvent detail is common pattern
    'no-param-reassign': 0,
    'lit-a11y/click-events-have-key-events': 0,
    // as project is small, many files that will export multiple only export one thing
    'import/prefer-default-export': 0,
    'max-classes-per-file': 0,
    'no-restricted-syntax': 0,
    // disagree with these
    'no-underscore-dangle': 0,
    'import/extensions': 0,

    'linebreak-style': 0,
    'no-console': 0,
    'no-shadow': ['error', { hoist: 'all' }],

    'prettier/prettier': ['error'],

    // lit-html rules : https://github.com/43081j/eslint-plugin-lit
    'lit/no-duplicate-template-bindings': 2,
    'lit/no-template-bind': 2,
    'lit/no-template-map': 2,
    'lit/attribute-value-entities': 2,
    'lit/binding-positions': 2,
    'lit/no-invalid-html': 2,
    'lit/no-useless-template-literals': 2,

    // need for test's expect()
    'no-unused-expressions': 0,
    'chai-friendly/no-unused-expressions': 2,

    // devDependencies
    'non-void-html-element-start-tag-with-trailing-solidus': 0,
    'import/no-extraneous-dependencies': [
      2,
      {
        devDependencies: ['ci/scripts/*.*'],
      },
    ],

    'no-empty': 'error',
    curly: ['error', 'all'],
    'sonarjs/no-nested-template-literals': 'off',
    'sonarjs/no-empty-collection': 'off',
  },
};
