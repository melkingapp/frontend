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
delete global.window.location;
global.window.location = {
  hostname: 'localhost',
  protocol: 'http:',
  host: 'localhost:5173',
  pathname: '/',
  search: '',
  hash: '',
};
