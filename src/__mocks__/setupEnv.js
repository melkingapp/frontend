// Mock import.meta
// Handled by babel-plugin-transform-import-meta

// Polyfill TextEncoder and TextDecoder for react-router-dom
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.scrollTo
global.window.scrollTo = jest.fn();

// We do NOT replace window.location here to avoid JSDOM errors.
// If specific tests need to mock location methods, they should do it individually
// or we can try to patch them non-destructively here.

try {
  // Attempt to mock navigation methods if they are not already mocked
  if (typeof window.location.assign !== 'function' || !jest.isMockFunction(window.location.assign)) {
     window.location.assign = jest.fn();
  }
  if (typeof window.location.replace !== 'function' || !jest.isMockFunction(window.location.replace)) {
     window.location.replace = jest.fn();
  }
  if (typeof window.location.reload !== 'function' || !jest.isMockFunction(window.location.reload)) {
     window.location.reload = jest.fn();
  }
} catch (e) {
  console.log('SetupEnv: Could not mock window.location methods:', e.message);
}
