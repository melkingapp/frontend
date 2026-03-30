
// This file runs before any test file, setting up the environment
// We mock import.meta.env manually because Jest + Babel doesn't support it natively in this setup

// Create a proxy to handle import.meta.env
// Note: This is a hack because Babel transform for import.meta is not standard in jest environment
// However, since we are using babel-jest, we might need a babel plugin for this.
// A simpler way is to use babel-plugin-transform-import-meta

// But let's try to see if we can just avoid importing this file in tests or mock it.
// The file is imported by apiService.js which is imported by slices.

// The best way to fix "SyntaxError: Cannot use 'import.meta' outside a module" in Jest
// is to use a babel plugin to transform it.

// But wait, the previous attempts deleted babel.config.js
// Let's modify babel.config.cjs to include the plugin if needed, OR
// we can mock the module `src/shared/utils/apiConfig.js` entirely in the test setup or test file.
