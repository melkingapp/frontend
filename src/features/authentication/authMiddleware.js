import { sanitizeUser } from '../../shared/utils/security.js';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // Only for auth actions (login, logout, etc.)
    if (action.type.startsWith("auth/")) {
        // Create a secure copy of the auth state for persistence
        const persistedAuth = {
            ...auth,
            user: sanitizeUser(auth.user), // Sanitize user object
            tokens: { access: null, refresh: null }, // Strip tokens to prevent XSS/Leakage
            loading: false, // Don't persist loading state
            error: null // Don't persist error state
        };

        localStorage.setItem("auth", JSON.stringify(persistedAuth));
    }

    return result;
};

export default authMiddleware;
