import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Security Fix: Sanitize user data and strip tokens before persisting to localStorage
        // This prevents sensitive data leaks (e.g. password hash, PII) and avoids token duplication
        const sanitizedAuth = {
            ...auth,
            user: sanitizeUser(auth.user),
            tokens: {
                access: null,
                refresh: null
            }
        };

        localStorage.setItem("auth", JSON.stringify(sanitizedAuth));
    }

    return result;
};

export default authMiddleware;
