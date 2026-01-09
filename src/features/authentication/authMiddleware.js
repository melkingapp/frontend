const authMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    // فقط برای login و logout
    if (action.type.startsWith("auth/")) {
        const { auth } = store.getState();

        // 🛡️ SECURITY: Only persist essential auth data to prevent data leakage.
        // We explicitly whitelist fields to ensure no sensitive future additions
        // (like payment tokens, PII, or temporary states like 'loading') are stored insecurely.
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
