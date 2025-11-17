import { Wrench, ShoppingBag, SprayCan, Wallet, Camera, Droplet, Car } from "lucide-react";
import { useSelector } from "react-redux";

export default function useCategories() {
    const expenseTypes = useSelector((state) => state.expenseTypes.expenseTypes);

    const iconMap = {
        charge: <Wallet size={14} />,
        repair: <Wrench size={14} />,
        cleaning: <SprayCan size={14} />,
        purchases: <ShoppingBag size={14} />,
        water_bill: <Droplet size={14} />,
        electricity_bill: <Camera size={14} />,
        camera: <Camera size={14} />,
        parking: <Car size={14} />,
    };

    // Default icon for custom expense types
    const getIconForValue = (value) => {
        if (value.startsWith("custom_")) {
            return <SprayCan size={14} />; // Default icon for custom types
        }
        return iconMap[value] || null;
    };

    const categories = [
        { value: "all", label: "همه", icon: null },
        // Filter out AddExpenseType from categories (it's only for form, not for filtering)
        ...expenseTypes
            .filter((t) => t.value !== "AddExpenseType")
            .map((t) => ({
                value: t.value,
                label: t.label,
                icon: getIconForValue(t.value),
            })),
    ];

    return categories;
}
