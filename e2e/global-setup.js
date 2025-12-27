// global-setup.js
const { chromium } = require('@playwright/test');

module.exports = async (config) => {
  // Setup code that runs before all tests
  console.log('Starting E2E test suite...');

  // You can add global setup logic here
  // For example: database seeding, API mocking setup, etc.

  // Store some global state if needed
  process.env.E2E_TEST_START_TIME = Date.now();
};
