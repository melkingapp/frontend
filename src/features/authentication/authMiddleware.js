const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    const { auth } = store.getState();

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        // Exclude tokens, loading, and error from persistence to prevent data leaks and state issues
        // eslint-disable-next-line no-unused-vars
        const { tokens, loading, error, ...authToSave } = auth;
        localStorage.setItem("auth", JSON.stringify(authToSave));
    }

    return result;
};

export default authMiddleware;
