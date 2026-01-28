import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // 🛡️ Sentinel Security Fix:
        // Prevent Sensitive Data Leaks in LocalStorage
        // 1. Remove tokens (access/refresh) - they are already managed by apiService
        // 2. Sanitize user object - prevent PII/password leaks
        const safeAuth = {
            ...auth,
            tokens: { access: null, refresh: null },
            user: sanitizeUser(auth.user)
        };
        localStorage.setItem("auth", JSON.stringify(safeAuth));
    }

    return result;
};

export default authMiddleware;
