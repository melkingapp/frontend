// Mock import.meta
// Note: mocking import.meta via global is not syntactically valid in JS,
// but we leave this here in case some transformation relies on it or it was intended for something else.
// Real solution for import.meta requires babel transformation.

// Polyfill TextEncoder and TextDecoder for react-router-dom
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.location for tests
// JSDOM v26+ makes window.location non-configurable.
// We should rely on JSDOM's location or use navigation methods if needed.
// Removing the delete/redefine logic to avoid errors.
