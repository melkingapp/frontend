
import { jest } from '@jest/globals';
import authMiddleware from '../authMiddleware';

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

const mockStore = {
  getState: jest.fn(),
  dispatch: jest.fn(),
};

const next = jest.fn();

describe('authMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should sanitize auth state before saving to localStorage', () => {
    const authState = {
      user: {
        id: 1,
        username: 'test',
        password: 'hashed_password', // Sensitive
        extra: 'sensitive',          // Extra
        role: 'manager'
      },
      tokens: { access: 'access123', refresh: 'refresh123' },
      isAuthenticated: true,
      error: 'some error',
      loading: false
    };

    mockStore.getState.mockReturnValue({ auth: authState });

    const action = { type: 'auth/login/fulfilled' };

    authMiddleware(mockStore)(next)(action);

    expect(localStorage.setItem).toHaveBeenCalledWith('auth', expect.any(String));

    const savedAuth = JSON.parse(localStorage.setItem.mock.calls[0][1]);

    // Check that sensitive data is REMOVED
    expect(savedAuth.tokens.access).toBeNull();
    expect(savedAuth.tokens.refresh).toBeNull();

    // Check that user is sanitized (whitelist check)
    expect(savedAuth.user.username).toBe('test');
    expect(savedAuth.user.role).toBe('manager');
    expect(savedAuth.user.password).toBeUndefined(); // Should be removed
    expect(savedAuth.user.extra).toBeUndefined();    // Should be removed

    // Check that isAuthenticated is preserved
    expect(savedAuth.isAuthenticated).toBe(true);
  });
});
