// global-teardown.js

module.exports = async (config) => {
  // Cleanup code that runs after all tests
  console.log('E2E test suite completed.');

  const startTime = process.env.E2E_TEST_START_TIME;
  if (startTime) {
    const duration = Date.now() - parseInt(startTime);
    console.log(`Total test duration: ${duration}ms`);
  }

  // You can add global cleanup logic here
  // For example: cleanup test data, close connections, etc.
};
