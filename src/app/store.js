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

// مقدار اولیه از localStorage بخونه
const savedAuth = localStorage.getItem("auth");
const accessToken = localStorage.getItem("access_token");
const refreshToken = localStorage.getItem("refresh_token");

let preloadedState = undefined;

if (savedAuth) {
    try {
        const parsedAuth = JSON.parse(savedAuth);

        // Merge tokens from secure storage (or separate keys) if they are missing/null in the blob
        // This handles the case where we strip tokens from the persisted 'auth' blob
        if (parsedAuth) {
            preloadedState = {
                auth: {
                    ...parsedAuth,
                    tokens: {
                        access: accessToken || parsedAuth.tokens?.access || null,
                        refresh: refreshToken || parsedAuth.tokens?.refresh || null,
                    }
                }
            };
        }
    } catch (e) {
        console.error("Error parsing auth state from localStorage:", e);
    }
} else if (accessToken) {
    // If no auth blob but we have tokens, we might want to at least set them
    // though usually we need the user object too.
     preloadedState = {
        auth: {
            user: {
                id: null,
                username: null,
                email: null,
                first_name: null,
                last_name: null,
                phone_number: null,
                role: null,
                is_active: false,
            },
            tokens: {
                access: accessToken,
                refresh: refreshToken,
            },
            isAuthenticated: !!accessToken, // Basic check, ideally verify token
            loading: false,
            error: null,
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
