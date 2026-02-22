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
// JSDOM 26+ does not allow deleting or overwriting window.location easily.
// Navigating via assignment to window.location causes "Not implemented: navigation" error.
// We should rely on JSDOM's default location or use specific navigation mocks if needed.
// delete global.window.location;
// global.window.location = {
//   hostname: 'localhost',
//   protocol: 'http:',
//   host: 'localhost:5173',
//   pathname: '/',
//   search: '',
//   hash: '',
// };
