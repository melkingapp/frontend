import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Create a secure copy of the state for persistence
        const stateToPersist = {
            ...auth,
            // 1. Do NOT persist tokens in the large JSON blob
            // Tokens are managed securely by apiService via specific keys (access_token, refresh_token)
            tokens: {
                access: null,
                refresh: null
            },
            // 2. Sanitize user object to remove sensitive data (like password hashes, etc.)
            user: sanitizeUser(auth.user)
        };

        localStorage.setItem("auth", JSON.stringify(stateToPersist));
    }

    return result;
};

export default authMiddleware;
