
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(js|jsx)',
    '<rootDir>/src/**/*.(test|spec).(js|jsx)',
    '<rootDir>/repro_security_log.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/setupTests.js',
    '!src/**/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  // Restoring extensionsToTreatAsEsm to match original config structure roughly,
  // but keeping it commented if it causes issues with current jest version or ensuring it's correct.
  // The original error was "failed to load ES module ... make sure to set type: module".
  // Since we are running in a type: module package, we need to be careful.
  // extensionsToTreatAsEsm: ['.jsx', '.js'],
  transformIgnorePatterns: [
    '/node_modules/(?!(@remix-run|react-router|react-router-dom)/)',
  ],
};
