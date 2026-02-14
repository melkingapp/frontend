
import authMiddleware from '../authMiddleware';
import { sanitizeUser } from '../../../shared/utils/security';

// Mock sanitizeUser to return a sanitized version
jest.mock('../../../shared/utils/security', () => ({
  sanitizeUser: jest.fn((user) => {
    // Simulate removing sensitive fields
    const { sensitive, password, ...rest } = user || {};
    return rest;
  }),
}));

describe('authMiddleware', () => {
  let store;
  let next;
  let action;

  beforeEach(() => {
    store = {
      getState: jest.fn(),
    };
    next = jest.fn();
    action = { type: 'auth/login/fulfilled' };

    // Mock localStorage
    const localStorageMock = (() => {
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

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });

    jest.clearAllMocks();
  });

  it('should persist SAFE auth state to localStorage on auth actions', () => {
    const authState = {
      user: { id: 1, name: 'Test User', sensitive: 'secret', password: 'hashed_password' },
      tokens: { access: 'access_token_123', refresh: 'refresh_token_456' },
      isAuthenticated: true,
    };

    store.getState.mockReturnValue({ auth: authState });

    authMiddleware(store)(next)(action);

    expect(next).toHaveBeenCalledWith(action);
    expect(localStorage.setItem).toHaveBeenCalled();

    const storedAuth = JSON.parse(localStorage.setItem.mock.calls[0][1]);

    // Check that tokens are STRIPPED
    expect(storedAuth.tokens.access).toBeNull();
    expect(storedAuth.tokens.refresh).toBeNull();

    // Check that user is SANITIZED
    expect(storedAuth.user.sensitive).toBeUndefined();
    expect(storedAuth.user.password).toBeUndefined();
    expect(storedAuth.user.name).toBe('Test User');

    // Check sanitizeUser was called
    expect(sanitizeUser).toHaveBeenCalledWith(authState.user);
  });

  it('should not persist auth state on non-auth actions', () => {
    const authState = { user: {}, tokens: {}, isAuthenticated: false };
    store.getState.mockReturnValue({ auth: authState });
    action = { type: 'other/action' };

    authMiddleware(store)(next)(action);

    expect(next).toHaveBeenCalledWith(action);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
