/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  moduleFileExtensions: ["ts", "js", "json"],
  roots: ["<rootDir>/tests/server", "<rootDir>/tests/app"],
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/app/$1",
  },
  setupFiles: ["<rootDir>/tests/server/setup-env.cjs"],
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          baseUrl: ".",
          esModuleInterop: true,
          module: "CommonJS",
          moduleResolution: "Node",
          paths: {
            "~/*": ["app/*"],
          },
          strict: true,
          target: "ES2022",
          types: ["node", "jest"],
        },
      },
    ],
  },
};
