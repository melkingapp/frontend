import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Sentinel Security: Sanitize data before storing in localStorage
        // This ensures no sensitive fields (like password, internal flags) are leaked to localStorage
        // and removes transient state like loading/error.
        const sanitizedAuth = {
            user: sanitizeUser(auth.user),
            tokens: auth.tokens,
            isAuthenticated: auth.isAuthenticated,
        };
        localStorage.setItem("auth", JSON.stringify(sanitizedAuth));
    }

    return result;
};

export default authMiddleware;
