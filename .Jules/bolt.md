## 2024-05-24 - Handling import.meta.env in Jest
**Learning:** In a Vite project using `import.meta.env`, running Jest tests in a CommonJS environment (via Babel) causes SyntaxErrors because `import.meta` is not valid CJS.
**Action:** Use `babel-plugin-transform-define` to replace `import.meta.env.KEY` with static values in the test environment, instead of relying on `globals` or partial mocks which don't handle the syntax itself.
