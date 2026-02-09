import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Prepare sanitized auth object for storage
        // 1. Remove tokens (they are stored separately or should not be persisted here)
        // 2. Sanitize user object (keep only whitelisted fields)
        // 3. Remove transient state (loading, error)
        const storageAuth = {
            ...auth,
            user: sanitizeUser(auth.user),
            tokens: { access: null, refresh: null }, // Don't duplicate tokens in localStorage
            error: null,
            loading: false
        };

        localStorage.setItem("auth", JSON.stringify(storageAuth));
    }

    return result;
};

export default authMiddleware;
