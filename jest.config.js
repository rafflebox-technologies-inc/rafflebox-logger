module.exports = {
  collectCoverageFrom: ['<rootDir>/src/*.ts', '!<rootDir>/node_modules/', '!<rootDir>/build/', '!<rootDir>/*.js'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/test/tsconfig.json'
    }
  },
  preset: 'ts-jest',
  testEnvironment: 'node'
};
