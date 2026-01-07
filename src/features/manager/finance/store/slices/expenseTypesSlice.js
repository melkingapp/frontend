import { createSlice } from "@reduxjs/toolkit";

// Clean up localStorage on import to remove any existing AddExpenseType
const cleanupLocalStorage = () => {
    const saved = localStorage.getItem("expenseTypes");
    if (saved) {
        try {
            const types = JSON.parse(saved);
            const filteredTypes = types.filter(type => type.value !== "AddExpenseType");
            if (filteredTypes.length !== types.length) {
                localStorage.setItem("expenseTypes", JSON.stringify(filteredTypes));
                console.log("🧹 Cleaned up localStorage: removed AddExpenseType duplicates");
            }
        } catch {
            localStorage.removeItem("expenseTypes");
        }
    }
};

// Run cleanup immediately
cleanupLocalStorage();

const loadExpenseTypes = () => {
    const saved = localStorage.getItem("expenseTypes");
    if (saved) {
        try {
            const types = JSON.parse(saved);
            // Filter out AddExpenseType to avoid duplicates and clean up localStorage
            const filteredTypes = types.filter(type => type.value !== "AddExpenseType");
            // Update localStorage with cleaned data
            localStorage.setItem("expenseTypes", JSON.stringify(filteredTypes));
            return filteredTypes;
        } catch {
            // Clear corrupted data
            localStorage.removeItem("expenseTypes");
            return [];
        }
    }
    return [];
};

const initialState = {
    expenseTypes: [
        { value: "water_bill", label: "قبض آب" },
        { value: "electricity_bill", label: "قبض برق" },
        { value: "camera", label: "دوربین" },
        { value: "parking", label: "پارکینگ" },
        // { value: "charge", label: "شارژ" },
        { value: "repair", label: "تعمیرات" },
        { value: "cleaning", label: "نظافت" },
        { value: "purchases", label: "اقلام خریدنی" },
        ...loadExpenseTypes(),
    ],
};

export const expenseTypesSlice = createSlice({
    name: "expenseTypes",
    initialState,
    reducers: {
        addExpenseType: (state, action) => {
            const exists = state.expenseTypes.some(
                (type) => type.value === action.payload.value
            );
            if (!exists) {
                state.expenseTypes.push(action.payload);

                const currentSaved = loadExpenseTypes();
                localStorage.setItem(
                    "expenseTypes",
                    JSON.stringify([...currentSaved, action.payload])
                );
            }
        },
    },
});

export const { addExpenseType } = expenseTypesSlice.actions;
export default expenseTypesSlice.reducer;