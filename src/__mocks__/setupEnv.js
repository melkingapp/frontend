// Mock import.meta
// Note: This global mock is for environments that don't support import.meta natively.
// However, babel-plugin-transform-import-meta usually replaces import.meta.env
// so this might not be needed if Babel is working correctly, but it's safe to keep.

// Polyfill TextEncoder and TextDecoder for react-router-dom
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.location for tests
// Use Object.defineProperty to avoid "Not implemented: navigation" error in newer JSDOM
// Only define if not already defined or writable
try {
  // If window.location is configurable, we can delete/reassign it.
  // In older JSDOM it might be configurable, in newer it might not be.
  // If we can't redefine it, we can try to mutate it if it's an object?
  // But window.location is usually special.

  // Actually, JSDOM 22+ locks down window.location.
  // The official way is using Object.defineProperty to override specific properties if possible,
  // or use `jsdom.reconfigure` if we have access to it (which we don't easily in Jest environment).

  // However, for Jest, we can try to shadow it on the global object if `testEnvironment` is `jsdom`.
  // But `window` is the global object.

  // Let's try to just define properties on the existing location object if we can't replace it.

  if (window.location) {
     // Try to assign mock functions to existing location if configurable
     // but usually assign/reload/replace are methods on the location object.
     // If they are read-only, we might fail here.
     try { window.location.assign = jest.fn(); } catch (e) {}
     try { window.location.reload = jest.fn(); } catch (e) {}
     try { window.location.replace = jest.fn(); } catch (e) {}

     // Note: hostname/protocol etc are accessors.
  }

} catch (e) {
  console.error("Failed to mock window.location methods", e);
}
