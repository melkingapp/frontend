import { sanitizeUser } from '../../shared/utils/security';

const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // Only for login and logout actions
    if (action.type.startsWith("auth/")) {
        // Prevent storing sensitive data like tokens or passwords in the auth object
        // Tokens are stored separately in localStorage keys 'access_token' and 'refresh_token' if needed,
        // but should not be duplicated in the Redux state dump.
        const stateToPersist = {
            isAuthenticated: auth.isAuthenticated,
            user: sanitizeUser(auth.user),
            // Explicitly excluding tokens and other potential state
        };

        localStorage.setItem("auth", JSON.stringify(stateToPersist));
    }

    return result;
};

export default authMiddleware;
