import { sanitizeUser } from "../../shared/utils/security";

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        const authToSave = {
            ...auth,
            user: auth.user ? sanitizeUser(auth.user) : auth.user
        };
        localStorage.setItem("auth", JSON.stringify(authToSave));
    }

    return result;
};

export default authMiddleware;
