import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Strip sensitive tokens and sanitize user data before persisting
        const sanitizedAuth = {
            ...auth,
            user: sanitizeUser(auth.user),
            tokens: { access: null, refresh: null }
        };
        localStorage.setItem("auth", JSON.stringify(sanitizedAuth));
    }

    return result;
};

export default authMiddleware;
