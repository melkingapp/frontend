## 2024-05-23 - React Render Optimization and Test Infrastructure
**Learning:** Found that `UnitBase.jsx` was re-calculating expensive grouping logic on every render, even when data didn't change. Also discovered that the project's test infrastructure was broken for ESM projects (missing `jest-environment-jsdom` and babel transforms for `import.meta.env`).
**Action:** Always verify if expensive logic inside `render` depends on stable data and wrap it in `useMemo`. When setting up tests in a Vite/ESM project, ensure `babel-plugin-transform-vite-meta-env` is used to handle `import.meta.env`.
