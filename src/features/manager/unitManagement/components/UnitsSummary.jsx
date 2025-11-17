import { useState } from "react";
import { Home, Inbox, Receipt } from "lucide-react";
import InfoCards from "../../../../shared/components/shared/display/InfoCard";

export default function UnitsSummary({ onItemClick, highlightableKeys = [] }) {
    const [activeKey, setActiveKey] = useState(null);

    const items = [
        { label: "مدیریت واحدها", icon: Home, key: "unitsmanagement" },
        { label: "درخواست ها", icon: Inbox, key: "requests" },
        { label: "تراکنش هر واحد", icon: Receipt, key: "transactions" },
    ];

    return (
        <InfoCards
            items={items.map(item => ({
                ...item,
                onClick: () => {
                    if (highlightableKeys.includes(item.key)) {
                        setActiveKey(item.key);
                    }
                    onItemClick?.(item.key);
                },
                cardClass:
                    highlightableKeys.includes(item.key) && activeKey === item.key
                        ? "bg-melkingGold cursor-pointer"
                        : "cursor-pointer",
                iconClass:
                    highlightableKeys.includes(item.key) && activeKey === item.key
                        ? "text-melkingDarkBlue"
                        : "text-melkingGold",
                labelClass:
                    highlightableKeys.includes(item.key) && activeKey === item.key
                        ? "font-bold mb-4 text-melkingDarkBlue"
                        : "font-bold mb-4 text-melkingGold",
            }))}
            containerClass="bg-melkingDarkBlue px-4 py-0 rounded-xl"
        />
    );
}
