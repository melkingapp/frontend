import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Create a secure version of the auth state for storage
        const secureAuth = {
            ...auth,
            // Strip tokens to prevent redundant/insecure storage in localStorage
            // Tokens are managed separately by apiService in access_token/refresh_token keys
            tokens: {
                access: null,
                refresh: null
            },
            // Sanitize user object to remove sensitive fields (PII, password hashes, etc.)
            user: sanitizeUser(auth.user)
        };

        localStorage.setItem("auth", JSON.stringify(secureAuth));
    }

    return result;
};

export default authMiddleware;
