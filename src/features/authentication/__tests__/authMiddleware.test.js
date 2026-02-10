import authMiddleware from '../authMiddleware';
import { sanitizeUser } from '../../../shared/utils/security';

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sanitizeUser
jest.mock('../../../shared/utils/security', () => ({
  sanitizeUser: jest.fn(user => {
    if (!user) return null;
    const { secret, ...rest } = user;
    return { ...rest, sanitized: true };
  }),
}));

describe('authMiddleware', () => {
  let store;
  let next;
  let invoke;

  beforeEach(() => {
    store = {
      getState: jest.fn(() => ({
        auth: {
          user: { id: 1, name: 'Test', secret: 'hidden' },
          tokens: { access: 'token', refresh: 'refresh' },
          isAuthenticated: true
        }
      }))
    };
    next = jest.fn(action => action);
    invoke = action => authMiddleware(store)(next)(action);
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('should sanitize user and strip tokens when saving to localStorage on auth/ action', () => {
    const action = { type: 'auth/login' };
    invoke(action);

    expect(localStorage.setItem).toHaveBeenCalledTimes(1);

    const storedAuth = JSON.parse(localStorage.setItem.mock.calls[0][1]);

    // Check tokens are stripped
    expect(storedAuth.tokens).toEqual({ access: null, refresh: null });

    // Check user is sanitized
    expect(storedAuth.user.secret).toBeUndefined();
    expect(storedAuth.user.sanitized).toBe(true);

    expect(sanitizeUser).toHaveBeenCalledWith({ id: 1, name: 'Test', secret: 'hidden' });
  });

  test('should NOT update localStorage on non-auth action', () => {
    const action = { type: 'other/action' };
    invoke(action);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
