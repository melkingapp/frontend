import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Create a sanitized copy of auth state for storage
        const sanitizedAuth = {
            ...auth,
            // Sanitize user object to remove sensitive data and keep only whitelisted fields
            user: sanitizeUser(auth.user),
            // Strip tokens from the persisted state to avoid duplication and security risks
            // Tokens are managed via apiService and stored in separate keys (access_token, refresh_token)
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
