import { sanitizeUser } from "../../shared/utils/security";

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Create a copy of auth state to avoid mutation
        const authToSave = { ...auth };

        // Sanitize user object if it exists
        if (authToSave.user) {
            authToSave.user = sanitizeUser(authToSave.user);
        }

        // DO NOT store tokens in auth blob in localStorage
        // Tokens are managed separately by apiService in access_token/refresh_token keys
        // Storing them here is redundant and increases attack surface
        authToSave.tokens = {
            access: null,
            refresh: null
        };

        localStorage.setItem("auth", JSON.stringify(authToSave));
    }

    return result;
};

export default authMiddleware;
