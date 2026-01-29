## 2024-05-23 - Jest Configuration in ESM Projects
**Learning:** This project uses `"type": "module"` in `package.json`. Standard `jest.config.js` (CJS) and `babel.config.js` (CJS) conflict with this setting unless renamed to `.cjs`. However, renaming them causes infrastructure changes that are considered blocking in this environment.
**Action:** When working on tests in this environment, try to use existing configurations or run tests in a way that doesn't require modifying the root config files (e.g., inline config or separate temp config if allowed, otherwise rely on manual verification or existing tests).

## 2024-05-23 - Jest Mock Hoisting and ESM
**Learning:** Importing `jest` from `@jest/globals` does not work inside `jest.mock` factories because of hoisting. The import is not yet evaluated when the factory runs.
**Action:** Do not import `jest` for use in `jest.mock`. Rely on the global `jest` object which is usually present in the JSDOM environment, or use `const { jest } = require('@jest/globals')` if in CJS.

## 2024-05-23 - Performance Optimization Verification
**Learning:** Optimizing `UnitBase` with `useMemo` is effective for preventing expensive re-calculations on every render.
**Action:** Always verify optimizations with tests to ensure functionality (grouping logic in this case) is preserved.
