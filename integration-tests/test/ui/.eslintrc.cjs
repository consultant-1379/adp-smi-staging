module.exports = {
  globals: {
    browser: true,
    $: 'readonly',
    $$: 'readonly',
    config: 'writable', // TODO remove global config object from WDIO Tests
  },
  rules: {
    // devDependencies
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
      },
    ],
  },
};
