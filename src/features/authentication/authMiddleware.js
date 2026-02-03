import { sanitizeUser } from "../../shared/utils/security";

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // Sync state with localStorage on auth actions
    if (action.type.startsWith("auth/")) {
        // 1. Manage Tokens separately
        if (auth.tokens) {
            if (auth.tokens.access) {
                localStorage.setItem("access_token", auth.tokens.access);
            } else {
                localStorage.removeItem("access_token");
            }

            if (auth.tokens.refresh) {
                localStorage.setItem("refresh_token", auth.tokens.refresh);
            } else {
                localStorage.removeItem("refresh_token");
            }
        }

        // 2. Sanitize auth state before saving to 'auth' blob
        // This prevents data leaks and redundancy
        const sanitizedAuth = {
            ...auth,
            tokens: { access: null, refresh: null }, // Tokens stored separately above
            user: sanitizeUser(auth.user), // Whitelist user fields
            loading: false, // Don't persist temporary UI states
            error: null,
        };

        localStorage.setItem("auth", JSON.stringify(sanitizedAuth));
    }

    return result;
};

export default authMiddleware;
