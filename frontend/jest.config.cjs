/**
 * Jest configuratie voor MarketPulse AI frontend tests
 * Specifiek ontworpen voor ES modules
 */

// CommonJS format voor Jest configuratie
module.exports = {
  // Basis configuratie
  testEnvironment: 'jsdom',
  verbose: true,
  
  // Transformaties
  transform: {
    '^.+\.(js|jsx)$': 'babel-jest'
  },
  
  // Transformeer deze bestanden niet
  transformIgnorePatterns: [
    '/node_modules/(?!(@mui|recharts|react-markdown|d3|d3-.*|internmap|delaunator|robust-predicates)/)',
  ],
  
  // Bestanden die moeten worden genegeerd tijdens het testen
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/dist/',
  ],
  
  // Bestanden die moeten worden behandeld als modules
  moduleNameMapper: {
    '\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/tests/__mocks__/fileMock.js',
  },
  
  // Setup bestanden die moeten worden uitgevoerd voor elke test
  setupFilesAfterEnv: [
    '<rootDir>/src/tests/setupTests.js',
  ],
  
  // Verzamel coverage informatie
  collectCoverage: true,
  coverageDirectory: 'coverage',
  
  // Specifieke instellingen voor ES modules
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  
  // Bestandsextensies en directories
  moduleFileExtensions: ['js', 'jsx', 'json'],
  moduleDirectories: ['node_modules', 'src'],
  
  // Test matching
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  
  // Timeout voor tests
  testTimeout: 15000,
};
