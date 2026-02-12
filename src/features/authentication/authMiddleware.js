import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Sanitize auth state before saving to localStorage
        const sanitizedAuth = {
            ...auth,
            user: sanitizeUser(auth.user),
            tokens: null // Do not store tokens in the state blob; they are stored separately
        };
        localStorage.setItem("auth", JSON.stringify(sanitizedAuth));
    }

    return result;
};

export default authMiddleware;
