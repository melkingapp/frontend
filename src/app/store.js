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

// Load auth state from localStorage
const savedAuthStr = localStorage.getItem("auth");
let savedAuth = savedAuthStr ? JSON.parse(savedAuthStr) : null;

// Load tokens from localStorage (they are stored separately for security)
const accessToken = localStorage.getItem("access_token");
const refreshToken = localStorage.getItem("refresh_token");

// Merge tokens back into auth state
if (savedAuth) {
    savedAuth = {
        ...savedAuth,
        tokens: {
            access: accessToken,
            refresh: refreshToken
        }
    };
} else if (accessToken) {
    // Fallback: If auth blob is missing but token exists (e.g. legacy or cleared storage)
    // Reconstruct minimal authenticated state
    savedAuth = {
        user: {}, // Profile will likely be fetched on mount
        tokens: {
            access: accessToken,
            refresh: refreshToken
        },
        isAuthenticated: true,
        loading: false,
        error: null
    };
}

const preloadedState = savedAuth
    ? { auth: savedAuth }
    : undefined;

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
