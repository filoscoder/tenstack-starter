const { defaults: tsjPreset } = require("ts-jest/presets");

module.exports = {
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
      diagnostics: false,
    },
  },
  preset: "ts-jest",
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    ...tsjPreset.transform,
  },
  testPathIgnorePatterns: ["dist"],
  testMatch: ["**/__tests__/**/*.test.(ts|js)"],
  testEnvironment: "node",
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  coverageThreshold: {
    global: {
      branches: 1,
      functions: 1,
      lines: 1,
      statements: 1,
    },
  },
  coverageReporters: ["json", "lcov", "text", "clover"],
};
