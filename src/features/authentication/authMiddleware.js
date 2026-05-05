import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        const sanitizedAuth = { ...auth };
        if (auth.user) {
            sanitizedAuth.user = sanitizeUser(auth.user);
        } else {
            sanitizedAuth.user = null; // Ensure fail-closed if user is undefined
        }
        localStorage.setItem("auth", JSON.stringify(sanitizedAuth));
    }

    return result;
};

export default authMiddleware;
