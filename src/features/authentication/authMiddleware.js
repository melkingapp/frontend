import { sanitizeUser } from "../../shared/utils/security";

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Sanitize user data before saving to localStorage
        // This prevents sensitive data (e.g., hashed passwords, internal notes) from being exposed
        const authToSave = {
            user: sanitizeUser(auth.user),
            tokens: auth.tokens,
            isAuthenticated: auth.isAuthenticated
        };

        localStorage.setItem("auth", JSON.stringify(authToSave));
    }

    return result;
};

export default authMiddleware;
