## 2024-05-22 - Jest Configuration for ESM/CJS Hybrid
**Learning:** The project uses `"type": "module"` in `package.json` but Jest runs in CommonJS (via `jest-environment-jsdom`). Configuration files (`jest.config.cjs`, `babel.config.cjs`) must use `.cjs` extension AND CommonJS syntax (`module.exports`), NOT `export default`. Conflicting `.js` configuration files caused resolution errors and had to be removed.
**Action:** When configuring Jest or Babel in this project, always use `.cjs` extension and `module.exports`. Ensure no conflicting `.js` config files exist.
