export const getPreloadedState = (storage = localStorage) => {
    const savedAuth = storage.getItem("auth");
    const accessToken = storage.getItem("access_token");
    const refreshToken = storage.getItem("refresh_token");

    let preloadedAuth = savedAuth ? JSON.parse(savedAuth) : undefined;

    // Rehydrate tokens if they exist separately (fixing the issue where sanitized auth doesn't have tokens)
    if (preloadedAuth && accessToken) {
        preloadedAuth = {
            ...preloadedAuth,
            tokens: {
                access: accessToken,
                refresh: refreshToken
            },
            isAuthenticated: true
        };
    }

    return preloadedAuth ? { auth: preloadedAuth } : undefined;
};
