import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Secure the data before saving to localStorage
        const safeAuth = {
            ...auth,
            // Do not persist tokens in the auth object (they are handled securely elsewhere or should be ephemeral)
            // Even if they are in Redux state, we don't want them in this specific localStorage key
            tokens: {
                access: null,
                refresh: null
            },
            // Sanitize user object to remove sensitive fields like password, internal flags, etc.
            user: sanitizeUser(auth.user)
        };

        localStorage.setItem("auth", JSON.stringify(safeAuth));
    }

    return result;
};

export default authMiddleware;
