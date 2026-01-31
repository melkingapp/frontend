import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authentication/authSlice";
import authMiddleware from "../features/authentication/authMiddleware";
import buildingReducer from "../features/manager/building/buildingSlice";
import financeReducer from "../features/manager/finance/store/slices/financeSlice";
import lettersReducer from "../features/manager/notification/slices/lettersSlice";
import servicesReducer from "../features/manager/notification/slices/servicesSlice";
import surveysReducer from "../features/manager/notification/slices/surveysSlice";
import expenseTypesReducer from "../features/manager/finance/store/slices/expenseTypesSlice";
import paymentsReducer from "../features/manager/finance/store/slices/paymentsSlice";
import extraPaymentReducer from "../features/manager/finance/store/slices/extraPaymentSlice";
import unitsReducer from "../features/manager/unitManagement/slices/unitsSlice";
import requestsReducer from "../features/manager/unitManagement/slices/requestsSlice";
import transactionsReducer from "../features/manager/unitManagement/slices/transactionsSlice";
import residentBuildingReducer from "../features/resident/building/residentBuildingSlice";
import buildingResidentsReducer from "../features/manager/building/slices/buildingResidentsSlice";
import membershipReducer from "../features/membership/membershipSlice";
import profileReducer from "../features/profile/profileSlice";
import settingsReducer from "../features/settings/settingsSlice";

// Load initial state from localStorage
const savedAuthStr = localStorage.getItem("auth");
const accessToken = localStorage.getItem("access_token");
const refreshToken = localStorage.getItem("refresh_token");

let preloadedState;

if (savedAuthStr) {
    try {
        const savedAuth = JSON.parse(savedAuthStr);

        // Reconstruct auth state by merging saved user data with tokens
        // This ensures we don't need to store tokens in the 'auth' object in localStorage
        preloadedState = {
            auth: {
                ...savedAuth,
                tokens: {
                    access: accessToken,
                    refresh: refreshToken
                },
                // Ensure isAuthenticated is consistent with token presence
                isAuthenticated: !!accessToken,
                loading: false,
                error: null
            }
        };
    } catch (e) {
        console.error("Failed to parse saved auth state:", e);
    }
} else if (accessToken) {
    // Fallback: If no auth object but tokens exist (e.g. migration or cleared cache)
    // We restore the tokens so the user stays logged in (profile might need fetching)
    preloadedState = {
        auth: {
            user: {}, // Will need to be fetched
            tokens: {
                access: accessToken,
                refresh: refreshToken
            },
            isAuthenticated: true,
            loading: false,
            error: null
        }
    };
}

const store = configureStore({
    reducer: {
        auth: authReducer,
        building: buildingReducer,
        finance: financeReducer,
        letters: lettersReducer,
        services: servicesReducer,
        surveys: surveysReducer,
        expenseTypes: expenseTypesReducer,
        payments: paymentsReducer,
        extraPayment: extraPaymentReducer,
        units: unitsReducer,
        requests: requestsReducer,
        transactions: transactionsReducer,
        residentBuilding: residentBuildingReducer,
        buildingResidents: buildingResidentsReducer,
        membership: membershipReducer,
        profile: profileReducer,
        settings: settingsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(authMiddleware),
    preloadedState,
});

export default store;
