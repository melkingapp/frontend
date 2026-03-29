import { sanitizeUser } from "../../shared/utils/security";

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Create a safe subset of auth state for persistence
        // We strictly exclude 'tokens' to prevent them from being stored in the 'auth' key
        // (apiService manages them separately in their own keys)
        const safeAuth = {
            isAuthenticated: auth.isAuthenticated,
            user: sanitizeUser(auth.user),
            // Explicitly exclude tokens, loading, error
        };
        localStorage.setItem("auth", JSON.stringify(safeAuth));
    }

    return result;
};

export default authMiddleware;
