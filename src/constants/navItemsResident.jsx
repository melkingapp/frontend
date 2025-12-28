import { CreditCard, MessageCircle, Bell, Settings, User, Home, Building2, Users, UserPlus, Sparkles, Plus } from "lucide-react";

export const navItemsResident = [
    {
        label: "مدیریت مالی",
        icon: <CreditCard size={20} />,
        to: "/resident/finance",
        children: [
            { label: "گردش مالی", to: "finance-reports" },
            // { label: "بیلان مالی", to: "finance/balance" },
            { label: "درخواست‌های پرداخت اضافی", to: "/resident/finance/extra-payment-requests" },
        ],
    },
    {
        label: "اطلاع‌رسانی",
        icon: <MessageCircle size={20} />,
        to: "/resident/notifications",
        children: [
            { label: "اخبار ساختمانی", to: "/resident/notifications/news" },
            { label: "خدمات", to: "/resident/notifications/services" },
            { label: "نظر سنجی", to: "/resident/notifications/survey" },
            // { label: "چت گروهی", to: "/resident/notifications/group-chat" },
        ],
    },
    {
        label: "مدیریت واحد من",
        icon: <Home size={20} />,
        to: "/resident/unit-management",
        children: [
            { label: "درخواست‌ها", to: "/resident/unit-management/requests" },
            { label: "تراکنش‌ها", to: "/resident/unit-management/transactions" },
        ],
    },
    {
        label: "درخواست‌های عضویت من",
        icon: <UserPlus size={20} />,
        to: "/resident/membership",
    },
    {
        label: "دستیار حقوقی",
        icon: <Sparkles size={20} />,
        to: "/resident/legal-ai",
    },
    // {
    //     label: "تنظیمات",
    //     icon: <Settings size={20} />,
    //     to: "/resident/settings",
    // },
];
