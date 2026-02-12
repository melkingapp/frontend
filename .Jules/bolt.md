## 2024-05-22 - [Babel Config for import.meta]
**Learning:** Jest and Vite handle `import.meta` differently. A naive global replacement in Babel config breaks production builds.
**Action:** Use `api.env('test')` in `babel.config.cjs` to conditionally apply `import.meta` transformations only for tests.
