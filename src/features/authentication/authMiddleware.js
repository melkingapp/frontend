import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        localStorage.setItem("auth", JSON.stringify({ ...auth, user: sanitizeUser(auth.user) }));
    }

    return result;
};

export default authMiddleware;
