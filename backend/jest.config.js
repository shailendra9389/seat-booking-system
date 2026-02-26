module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts'],
    moduleNameMapper: {
        '^@config/(.*)$': '<rootDir>/src/config/$1',
        '^@modules/(.*)$': '<rootDir>/src/modules/$1',
        '^@core/(.*)$': '<rootDir>/src/core/$1',
        '^@database/(.*)$': '<rootDir>/src/database/$1',
    },
};
