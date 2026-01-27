import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // Only for login and logout
    if (action.type.startsWith("auth/")) {
        // Create a safe version of auth state for persistence
        const safeAuth = {
            ...auth,
            // Sanitize user object to remove sensitive fields like password
            user: sanitizeUser(auth.user),
            // Explicitly exclude tokens from localStorage persistence
            // Tokens are managed separately by apiService
            tokens: {
                access: null,
                refresh: null
            }
        };

        localStorage.setItem("auth", JSON.stringify(safeAuth));
    }

    return result;
};

export default authMiddleware;
