/** @type {import('ts-jest').JestConfigWithTsJest} */
const jestConfig = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    // This tells Jest: "If you see an import for a .js file, look for a .ts file instead"
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        diagnostics: { ignoreCodes: [151002] },
      },
    ],
  },
  modulePaths: ["<rootDir>/src"],
};

export default jestConfig;
