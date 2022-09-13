const { npm_package_name: npmPackageName, INIT_CWD: packageDirectory, PROJECT_CWD: projectDirectory } = process.env;

export default async () => ({
  clearMocks: true,

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ['jest-sinon'],

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { rootMode: 'upward' }],
  },
  testMatch: [`${packageDirectory}/**/test/**/*.test.ts`],
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [ `.${packageDirectory.replace(projectDirectory, '')}/src/**/*.{ts,js}` ],
  coverageDirectory: `${projectDirectory}/dist/coverage/${npmPackageName}`,
  coverageReporters: [
    ['lcov', { projectRoot: '..' }],
    ['text', { skipFull: true }],
  ],
  passWithNoTests: true,
});
