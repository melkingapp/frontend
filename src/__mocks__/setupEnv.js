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

// Mock window.location for tests - JSDOM handles this now, so we don't redefine it to avoid errors.
// If specific location properties need to be mocked, do it per test or use Object.defineProperty on specific properties if writable.
