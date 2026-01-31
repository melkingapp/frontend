const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    // Only update localStorage for auth actions
    if (action.type.startsWith("auth/")) {
        const { auth } = store.getState();

        // Sync tokens to their specific storage keys
        // This acts as a safety net ensuring tokens are persisted even if the calling code missed it
        if (auth.tokens?.access) {
            localStorage.setItem('access_token', auth.tokens.access);
        }
        if (auth.tokens?.refresh) {
            localStorage.setItem('refresh_token', auth.tokens.refresh);
        }

        // Handle logout specifically to clear tokens
        if (action.type === 'auth/logout' || action.type === 'auth/forceLogout') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
        }

        // Create a sanitized version of auth state for persistence
        // We exclude tokens (stored separately securely) and transient states (loading, error)
        const authToSave = {
            ...auth,
            tokens: {
                access: null,
                refresh: null
            },
            loading: false,
            error: null
        };

        localStorage.setItem("auth", JSON.stringify(authToSave));
    }

    return result;
};

export default authMiddleware;
