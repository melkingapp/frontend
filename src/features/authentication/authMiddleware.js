import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Create a secure version of the auth state
        const secureAuth = {
            ...auth,
            // Do NOT store tokens in the persistent JSON blob
            // They are already stored in 'access_token' and 'refresh_token' keys managed by apiService
            tokens: { access: null, refresh: null },
            // Sanitize user object to remove any potential sensitive fields like password hashes
            user: sanitizeUser(auth.user),
        };

        localStorage.setItem("auth", JSON.stringify(secureAuth));
    }

    return result;
};

export default authMiddleware;
