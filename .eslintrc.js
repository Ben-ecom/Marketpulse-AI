module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    // Sta CommonJS module.exports toe
    'import/prefer-default-export': 'off',
    // Sta console.log toe voor server-side code
    'no-console': 'off',
    // Sta functie hoisting toe
    'no-use-before-define': ['error', { functions: false }],
    // Sta underscore toe in variabele namen
    'no-underscore-dangle': 'off',
    // Max line length - verhoog naar 150 om minder fouten te krijgen
    'max-len': ['warn', { code: 150 }],
    // Sta camelcase toe
    camelcase: 'off',
    // Sta object spread toe
    'prefer-object-spread': 'off',
    // Sta object shorthand toe
    'object-shorthand': 'off',
    // Sta arrow function body style toe
    'arrow-body-style': 'off',
    // Sta function expressions toe
    'func-names': 'off',
    // Sta meerdere exports toe
    'import/no-mutable-exports': 'off',
    // Sta CommonJS require toe
    'global-require': 'off',
    // Sta ongebruikte variabelen toe als waarschuwing
    'no-unused-vars': 'warn',
    // Sta inconsistent gebruik van async/await toe als waarschuwing
    'consistent-return': 'warn',
    // Sta redundant gebruik van await toe
    'no-return-await': 'off',
    // Sta unsafe optional chaining toe als waarschuwing
    'no-unsafe-optional-chaining': 'warn',
    // Sta shadowing toe als waarschuwing
    'no-shadow': 'warn',
    // Sta class-methods-use-this toe als waarschuwing
    'class-methods-use-this': 'warn',
    // Sta plusplus toe
    'no-plusplus': 'off',
    // Sta comma-dangle toe als waarschuwing
    'comma-dangle': 'warn',
    // Sta object-curly-newline toe als waarschuwing
    'object-curly-newline': 'warn',
    // Sta quote-props toe als waarschuwing
    'quote-props': 'warn',
    // Sta prefer-exponentiation-operator toe als waarschuwing
    'prefer-exponentiation-operator': 'warn',
    // Sta no-restricted-properties toe als waarschuwing
    'no-restricted-properties': 'warn',
  },
  overrides: [
    {
      files: ['src/client/**/*.js', 'src/client/**/*.jsx'],
      env: {
        browser: true,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      rules: {
        // Voor client-side code, sta ES6 modules toe
        'import/prefer-default-export': 'off',
      },
    },
    {
      files: ['*.test.js', '*.spec.js', 'test-*.js'],
      rules: {
        // Voor test bestanden, sta ongebruikte variabelen toe
        'no-unused-vars': 'off',
      },
    },
  ],
  ignorePatterns: ['src/client/**/*.jsx'],
};
