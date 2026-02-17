import { sanitizeUser } from "../../shared/utils/security";

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Sanitize sensitive data and exclude transient state
        const sanitizedAuth = {
            user: sanitizeUser(auth.user),
            tokens: auth.tokens,
            isAuthenticated: auth.isAuthenticated,
        };
        localStorage.setItem("auth", JSON.stringify(sanitizedAuth));
    }

    return result;
};

export default authMiddleware;
