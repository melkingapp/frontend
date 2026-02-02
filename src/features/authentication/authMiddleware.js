import { sanitizeUser } from "../../shared/utils/security";

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Sanitize auth state before saving to localStorage
        // 1. Remove tokens (stored separately in secure keys)
        // 2. Remove loading/error states
        // 3. Sanitize user object (PII protection)
        const sanitizedAuth = {
            ...auth,
            tokens: { access: null, refresh: null }, // Do not persist tokens in auth blob
            loading: false,
            error: null,
            user: sanitizeUser(auth.user)
        };

        localStorage.setItem("auth", JSON.stringify(sanitizedAuth));
    }

    return result;
};

export default authMiddleware;
