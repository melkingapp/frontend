import authMiddleware from '../authMiddleware';

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('authMiddleware', () => {
  let store;
  let next;
  let action;

  beforeEach(() => {
    store = {
      getState: jest.fn(),
    };
    next = jest.fn();
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('securely sanitizes user data before saving to localStorage', () => {
    // Setup state with sensitive data
    const sensitiveUser = {
      id: 1,
      username: 'testuser',
      password: 'hashed_password_123', // Sensitive!
      internal_api_key: 'secret_key_abc', // Sensitive!
      role: 'admin',
      email: 'test@example.com'
    };

    const authState = {
      user: sensitiveUser,
      tokens: { access: 'access_token', refresh: 'refresh_token' },
      isAuthenticated: true,
      loading: false,
      error: null
    };

    store.getState.mockReturnValue({ auth: authState });

    // Action that triggers the middleware
    action = { type: 'auth/login/fulfilled' };

    // Call middleware
    authMiddleware(store)(next)(action);

    // Verify localStorage.setItem was called
    expect(localStorage.setItem).toHaveBeenCalledWith('auth', expect.any(String));

    // Get the saved data
    const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);

    // Assert that sensitive data IS REMOVED
    expect(savedData.user).not.toHaveProperty('password');
    expect(savedData.user).not.toHaveProperty('internal_api_key');

    // Assert that allowed data IS PRESERVED
    expect(savedData.user).toHaveProperty('username', 'testuser');
    expect(savedData.user).toHaveProperty('role', 'admin');
    expect(savedData.user).toHaveProperty('email', 'test@example.com');

    // Assert that tokens are NULLified (security enhancement)
    expect(savedData.tokens.access).toBeNull();
    expect(savedData.tokens.refresh).toBeNull();

    // Assert isAuthenticated is preserved
    expect(savedData.isAuthenticated).toBe(true);

    // Assert internal state (loading/error) is NOT saved
    expect(savedData).not.toHaveProperty('loading');
    expect(savedData).not.toHaveProperty('error');
  });
});
