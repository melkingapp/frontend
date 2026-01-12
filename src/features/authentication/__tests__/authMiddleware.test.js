import { jest } from '@jest/globals';
import { sanitizeUser } from '../../../shared/utils/security';
import authMiddleware from '../authMiddleware';

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: jest.fn(key => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

describe('authMiddleware', () => {
  let store;
  let next;

  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.setItem.mockClear();

    store = {
      getState: jest.fn(),
    };
    next = jest.fn((action) => action);
  });

  it('should sanitize user object before storing in localStorage for auth/* actions', () => {
    // Setup state with sensitive data
    const mockAuth = {
      user: {
        id: 1,
        username: 'testuser',
        password_hash: 'secret_hash',
        internal_flag: 'secret_flag',
        email: 'test@example.com'
      },
      tokens: { access: 'token', refresh: 'refresh' }
    };

    store.getState.mockReturnValue({ auth: mockAuth });

    const action = { type: 'auth/loginUser/fulfilled' };

    authMiddleware(store)(next)(action);

    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth', expect.any(String));

    const storedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);

    // Check that sensitive fields are removed
    expect(storedData.user.password_hash).toBeUndefined();
    expect(storedData.user.internal_flag).toBeUndefined();

    // Check that allowed fields are present
    expect(storedData.user.id).toBe(1);
    expect(storedData.user.username).toBe('testuser');
    expect(storedData.user.email).toBe('test@example.com');
  });

  it('should not modify localStorage for non-auth actions', () => {
    store.getState.mockReturnValue({ auth: {} });
    const action = { type: 'other/action' };

    authMiddleware(store)(next)(action);

    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });
});
