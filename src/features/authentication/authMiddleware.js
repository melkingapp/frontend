import { sanitizeUser } from '../../shared/utils/security.js';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        let authToSave = auth;

        if (auth.user) {
            const sanitizedUser = sanitizeUser(auth.user);
            if (sanitizedUser) {
                 authToSave = { ...auth, user: sanitizedUser };
            } else {
                 // Fail-closed: if sanitization fails (returns null but user existed), don't save raw user
                 authToSave = { ...auth, user: null };
            }
        }

        localStorage.setItem("auth", JSON.stringify(authToSave));
    }

    return result;
};

export default authMiddleware;
