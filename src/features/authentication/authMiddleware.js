import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Securely persist only necessary and safe data
        const stateToSave = {
            user: sanitizeUser(auth.user),
            isAuthenticated: auth.isAuthenticated,
            // Exclude tokens (stored separately in localStorage), loading, error, and sensitive user fields
        };

        localStorage.setItem("auth", JSON.stringify(stateToSave));
    }

    return result;
};

export default authMiddleware;
