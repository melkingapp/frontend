## 2024-05-24 - Jest Config Fragility in ESM Projects
**Learning:** In a project with `"type": "module"` in `package.json`, Jest configuration requires careful handling. `jest.config.js` is treated as ESM, making `module.exports` invalid. `jest.config.cjs` forces CommonJS, but cannot use `export default`.
**Action:** Always use `jest.config.cjs` with `module.exports` for Jest configuration in ESM projects to ensure stability and avoid `SyntaxError` or `ReferenceError`.
