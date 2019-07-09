module.exports = {
    "testEnvironment": "jsdom",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "json"
    ],
    "transform": {
        "^.+\\.tsx?$": "<rootDir>/node_modules/ts-jest/preprocessor.js"
    },
    "testRegex": "/src/.*\\.(test|spec).(ts|tsx|js)$",
    "collectCoverageFrom": [
        "src/**/*.{js,jsx,tsx,ts}",
        "!**/node_modules/**",
        "!**/vendor/**"
    ],
    "coverageReporters": [
        "json",
        "lcov"
    ],
    "setupFilesAfterEnv": ["jest-extended"]
};
