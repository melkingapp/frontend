// Mock import.meta
// Note: This is now handled by babel config plugin, but keeping it as fallback or for other uses
if (!global.import) {
  global.import = {
    meta: {
      env: {
        VITE_API_BASE_URL: 'http://127.0.0.1:8000/api/v1',
      },
    },
  };
}

// Polyfill TextEncoder and TextDecoder for react-router-dom
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.location for tests - skipping modification as it is non-configurable in JSDOM
// If specific tests need to mock location, they should use jest.spyOn or other techniques locally.
