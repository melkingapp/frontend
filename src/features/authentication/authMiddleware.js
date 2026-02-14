import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Create a safe version of auth state for persistence
        const safeAuth = {
            ...auth,
            // Strip tokens to prevent duplication and sensitive data exposure
            // Tokens are managed separately by apiService/localStorage
            tokens: {
                access: null,
                refresh: null
            },
            // Sanitize user object to ensure only whitelisted fields are stored
            user: sanitizeUser(auth.user)
        };
        localStorage.setItem("auth", JSON.stringify(safeAuth));
    }

    return result;
};

export default authMiddleware;
