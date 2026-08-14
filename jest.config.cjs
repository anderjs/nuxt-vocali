/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  moduleFileExtensions: ["ts", "js", "json"],
  roots: ["<rootDir>/tests/server"],
  setupFiles: ["<rootDir>/tests/server/setup-env.cjs"],
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          esModuleInterop: true,
          module: "CommonJS",
          moduleResolution: "Node",
          strict: true,
          target: "ES2022",
          types: ["node", "jest"],
        },
      },
    ],
  },
};
