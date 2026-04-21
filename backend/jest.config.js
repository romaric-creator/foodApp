module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 30000,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/shared/$1'
  },
  testMatch: [
    '**/__tests__/**/*.test.js'
  ]
};
