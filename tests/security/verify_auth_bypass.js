
// verify_vulnerability.js

// Mocking the browser's localStorage
const localStorageMock = {
    store: {},
    getItem: function(key) {
        return this.store[key] || null;
    },
    setItem: function(key, value) {
        this.store[key] = value.toString();
    }
};

// 1. Attack Phase: Inject fake auth state into LocalStorage
console.log("🕵️ Sentinel: simulating Attack Phase...");
const fakeAuthData = {
    isAuthenticated: true,
    user: {
        id: 999,
        username: "hacker",
        role: "manager" // Elevating privilege to manager
    },
    tokens: {
        access: "fake_access_token_jwt_structure_is_irrelevant_for_hydration",
        refresh: "fake_refresh_token"
    }
};

localStorageMock.setItem("auth", JSON.stringify(fakeAuthData));
console.log("💉 Injected fake 'auth' state into localStorage:", JSON.stringify(fakeAuthData, null, 2));

// 2. Hydration Phase: Simulating store initialization in src/app/store.js
console.log("\n🔄 Sentinel: simulating App Hydration...");
const savedAuth = localStorageMock.getItem("auth");
const preloadedState = savedAuth
    ? { auth: JSON.parse(savedAuth) }
    : undefined;

// 3. Verification Phase: Check if the app considers us authenticated
console.log("\n🔍 Sentinel: Checking Initial State...");
if (preloadedState && preloadedState.auth.isAuthenticated) {
    console.log("❌ VULNERABILITY CONFIRMED: App initialized as AUTHENTICATED based on untrusted LocalStorage data.");
    console.log("   User Role:", preloadedState.auth.user.role);
    console.log("   Access granted to Protected Routes without server verification.");
} else {
    console.log("✅ SECURE: App did not trust LocalStorage blindly.");
}
