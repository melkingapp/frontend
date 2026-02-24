import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Create a copy to avoid mutating state
        const sanitizedAuth = { ...auth };

        // Remove tokens from persistence (they are stored separately by apiService)
        sanitizedAuth.tokens = {
            access: null,
            refresh: null
        };

        // Sanitize user object
        if (sanitizedAuth.user) {
            sanitizedAuth.user = sanitizeUser(sanitizedAuth.user);
        }

        localStorage.setItem("auth", JSON.stringify(sanitizedAuth));
    }

    return result;
};

export default authMiddleware;
