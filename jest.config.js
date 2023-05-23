module.exports = {
    transform: {
        '^.+\\.(t|j)sx?$': '@swc/jest'
    },
    coverageThreshold: {
        global: {
            branches: 10.26,
            functions: 10.75,
            lines: 47.16
        }
    },
    collectCoverage: true,
    collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}'],
    coverageReporters: ['json-summary', 'text-summary', 'lcov'],
    coveragePathIgnorePatterns: ['/node_modules/', 'index.ts', '/__tests__/']
};
