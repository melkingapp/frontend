// Mock import.meta
global.import = {
  meta: {
    env: {
      VITE_API_BASE_URL: 'http://127.0.0.1:8000/api/v1',
      DEV: true,
    },
  },
};

// Polyfill TextEncoder and TextDecoder for react-router-dom
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Do not delete window.location as it causes errors in JSDOM v26+
// Use Object.defineProperty if you really need to mock properties,
// or rely on default JSDOM location (http://localhost:5173/)
