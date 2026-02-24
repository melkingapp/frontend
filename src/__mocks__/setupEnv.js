// Mock import.meta
global.import = {
  meta: {
    env: {
      VITE_API_BASE_URL: 'http://127.0.0.1:8000/api/v1',
    },
  },
};

// Polyfill TextEncoder and TextDecoder for react-router-dom
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.location for tests
// JSDOM does not allow deleting window.location, so we can't redefine it simply.
// We should rely on JSDOM's location or use Object.defineProperty if we really need to mock it.
// However, since we are using jsdom environment, window.location exists.
// We can just add methods if they are missing or if we want to spy on them.

// For now, let's just ensure URL is localhost which JSDOM usually handles if configured.
// Or we can try to overwrite properties.
