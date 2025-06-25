module.exports = {
    verbose: true,
    roots: ['<rootDir>/src'],
    transform: { '^.+\\.tsx?$': 'ts-jest' },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testEnvironment: 'node',
    modulePaths: ['node_modules', '<rootDir>/src'],
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
};
