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

const preloadedState = savedAuth
    ? { auth: JSON.parse(savedAuth) }
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
