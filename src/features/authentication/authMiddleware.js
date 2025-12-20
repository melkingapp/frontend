import { sanitizeAuth } from "../../shared/utils/security";

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Sanitize auth state before persisting to localStorage
        const sanitizedAuth = sanitizeAuth(auth);
        localStorage.setItem("auth", JSON.stringify(sanitizedAuth));
    }

    return result;
};

export default authMiddleware;
