import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        const sanitizedAuth = {
            ...auth,
            user: sanitizeUser(auth.user)
        };
        localStorage.setItem("auth", JSON.stringify(sanitizedAuth));
    }

    return result;
};

export default authMiddleware;
