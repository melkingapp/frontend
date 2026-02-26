
// Mock apiConfig BEFORE importing apiService
jest.mock('../../utils/apiConfig', () => ({
  getApiBaseUrl: jest.fn(() => 'http://test-api.com'),
  getMediaBaseUrl: jest.fn(() => 'http://test-media.com'),
  __esModule: true,
}));

// Mock axios
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    },
    post: jest.fn(() => Promise.resolve({ data: { success: true } })),
    get: jest.fn(() => Promise.resolve({ data: { success: true } })),
    put: jest.fn(() => Promise.resolve({ data: { success: true } })),
    patch: jest.fn(() => Promise.resolve({ data: { success: true } })),
    delete: jest.fn(() => Promise.resolve({ data: { success: true } })),
  };
  return mockAxios;
});

import apiService from '../apiService';

describe('API Service Logging Security', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should redact sensitive data in POST request logs', async () => {
    const sensitiveData = {
      username: 'user1',
      password: 'secretPassword123',
      token: 'sensitiveTokenABC'
    };

    await apiService.post('/login', sensitiveData);

    // Verify console.log was called
    expect(consoleSpy).toHaveBeenCalled();

    // Find the call that logs the POST request
    const postLogCall = consoleSpy.mock.calls.find(call =>
      call[0] && call[0].includes('POST /login')
    );

    expect(postLogCall).toBeDefined();

    const loggedData = postLogCall[1].data;

    // Check redaction
    expect(loggedData.username).toBe('user1');
    expect(loggedData.password).toBe('[REDACTED]');
    expect(loggedData.token).toBe('[REDACTED]');
  });

  it('should redact sensitive data in nested objects', async () => {
      const nestedData = {
          user: {
              name: 'John',
              credit_card: '1234-5678-9012-3456'
          }
      };

      await apiService.post('/update-profile', nestedData);

      const postLogCall = consoleSpy.mock.calls.find(call =>
          call[0] && call[0].includes('POST /update-profile')
      );

      expect(postLogCall).toBeDefined();
      const loggedData = postLogCall[1].data;

      expect(loggedData.user.name).toBe('John');
      expect(loggedData.user.credit_card).toBe('[REDACTED]');
  });
});
