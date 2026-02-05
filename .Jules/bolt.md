## 2024-05-23 - Jest Mock Hoisting
**Learning:** Variables imported from modules (even `@jest/globals`) are not available inside `jest.mock` factories because factories are hoisted to the top of the file.
**Action:** Use `require` inside the mock factory to access modules like `@jest/globals` or rely on the global `jest` object if available in the environment.
