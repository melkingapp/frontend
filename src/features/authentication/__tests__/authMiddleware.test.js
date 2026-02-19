import authMiddleware from '../authMiddleware';

describe('authMiddleware', () => {
  let store;
  let next;
  let action;
  let localStorageMock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock localStorage
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    // Mock store
    store = {
      getState: jest.fn(),
      dispatch: jest.fn()
    };

    // Mock next
    next = jest.fn(action => action);
  });

  it('should persist sanitized user data to localStorage on auth actions', () => {
    // 1. Setup initial state with SENSITIVE data that should NOT be persisted
    const sensitiveUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'secret_hash_123', // SENSITIVE!
      internal_notes: 'admin notes',    // SENSITIVE!
      credit_card: '1234-5678',         // SENSITIVE!
      role: 'resident'
    };

    const authState = {
      user: sensitiveUser,
      tokens: { access: 'token123', refresh: 'refresh123' },
      isAuthenticated: true,
      loading: false,
      error: null
    };

    store.getState.mockReturnValue({ auth: authState });

    // 2. Dispatch an action that triggers the middleware (starts with auth/)
    action = { type: 'auth/login/fulfilled', payload: {} };

    // 3. Run middleware
    authMiddleware(store)(next)(action);

    // 4. Assertions
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth', expect.any(String));

    const storedAuth = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);

    // The stored user should NOT contain sensitive fields
    // THIS EXPECTATION WILL FAIL UNTIL THE FIX IS APPLIED
    expect(storedAuth.user).not.toHaveProperty('password_hash');
    expect(storedAuth.user).not.toHaveProperty('internal_notes');
    expect(storedAuth.user).not.toHaveProperty('credit_card');

    // The stored user SHOULD contain allowed fields
    expect(storedAuth.user).toHaveProperty('id', 1);
    expect(storedAuth.user).toHaveProperty('username', 'testuser');

    // Tokens and isAuthenticated should be preserved
    expect(storedAuth.tokens).toEqual(authState.tokens);
    expect(storedAuth.isAuthenticated).toBe(true);
  });
});
