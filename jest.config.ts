import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
    verbose: true,
    transform: { '^.+\\.ts?$': ['ts-jest', { useESM: true }] },
    extensionsToTreatAsEsm: ['.ts'],
    roots: ['<rootDir>/src'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testEnvironment: 'node',
    modulePaths: ['node_modules', '<rootDir>/src'],
    // setupFilesAfterEnv: ['<rootDir>/src/test-utils/setup.ts', '<rootDir>/src/test-utils/init-mocks.ts'],
    maxWorkers: 1,
    forceExit: true,
    preset: 'ts-jest',
    transformIgnorePatterns: ['node_modules/(?!(@datalust/winston-seq)/)'],
    moduleNameMapper: {
        '@datalust/winston-seq': '<rootDir>/__mocks__/@datalust/winston-seq.ts',
    },
};

export default config;
