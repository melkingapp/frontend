const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Only persist essential data to prevent leaks (e.g. error messages with PII)
        const safeAuth = {
            user: auth.user,
            tokens: auth.tokens,
            isAuthenticated: auth.isAuthenticated
        };
        localStorage.setItem("auth", JSON.stringify(safeAuth));
    }

    return result;
};

export default authMiddleware;
