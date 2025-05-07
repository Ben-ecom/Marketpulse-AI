/**
 * Jest configuratie voor MarketPulse AI
 */

module.exports = {
  // De testomgeving
  testEnvironment: 'jsdom',
  
  // Bestandspatronen voor tests
  testMatch: [
    '**/tests/**/*.test.js',
    '**/?(*.)+(spec|test).js',
    '**/__tests__/**/*.test.jsx',
    '**/?(*.)+(spec|test).jsx'
  ],
  
  // Bestanden die genegeerd moeten worden
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  
  // Transformaties voor verschillende bestandstypes
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  
  // Modulebestandsextensies
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  
  // Testdekking configuratie
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  
  // Rapportage formaten voor testdekking
  coverageReporters: ['text', 'lcov', 'clover'],
  
  // Minimale testdekking vereisten
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Verbose output
  verbose: true
};
