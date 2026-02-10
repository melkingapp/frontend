## 2024-05-23 - Jest Configuration Ambiguity
**Learning:** The project contains both `jest.config.js` (CJS content) and `jest.config.cjs`, which causes Jest to fail with "Multiple configurations found". Additionally, `jest-environment-jsdom` might be missing from `node_modules` despite being in `package.json`.
**Action:** When running tests locally, be aware that you might need to specify the config file explicitly (e.g., `jest --config jest.config.cjs`) or temporarily fix the ambiguity, but ALWAYS revert infrastructure changes before submission to avoid scope creep.
