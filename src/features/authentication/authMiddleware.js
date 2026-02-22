import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        const sensitiveState = {
            user: sanitizeUser(auth.user),
            tokens: { access: null, refresh: null },
            isAuthenticated: auth.isAuthenticated
        };
        localStorage.setItem("auth", JSON.stringify(sensitiveState));
    }

    return result;
};

export default authMiddleware;
