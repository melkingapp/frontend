import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Fix: Only store necessary and sanitized data
        // Explicitly excluding tokens and other transient state to prevent security leaks
        const stateToSave = {
            isAuthenticated: auth.isAuthenticated,
            user: sanitizeUser(auth.user),
        };
        localStorage.setItem("auth", JSON.stringify(stateToSave));
    }

    return result;
};

export default authMiddleware;
