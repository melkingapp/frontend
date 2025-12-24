import { CreditCard, PieChart, MessageCircle, Bell, Settings, User, Home, Building2, Users, CheckCircle, UserPlus, BookOpen, DollarSign } from "lucide-react";

export const navItemsManager = [
    {
        label: "مدیریت مالی",
        icon: <CreditCard size={20} />,
        // to: "/manager/finance",
        children: [
            { label: "گردش مالی", to: "/manager/finance-reports" },
            { label: "بیلان ساختمان", to: "/manager/finance/balance" },
            { label: "بررسی پرداخت", to: "/manager/finance/payments" },
            // { label: "نمودار گزارش", to: "/manager/finance/charts" },
        ],
    },
    {
        label: "اعلام شارژ",
        icon: <DollarSign size={20} />,
        to: "/manager/announce-charge",
    },
    {
        label: "اطلاع‌رسانی",
        icon: <MessageCircle size={20} />,
        to: "/manager/notifications",
        children: [
            { label: "اخبار ساختمانی", to: "/manager/notifications/news" },
            { label: "خدمات", to: "/manager/notifications/services" },
            { label: "نظر سنجی", to: "/manager/notifications/survey" },
            // { label: "چت گروهی", to: "/manager/notifications/group-chat" },
        ],
    },
    // {
    //     label: "خدمات ساختمانی",
    //     icon: <Building2 size={20} />,
    //     to: "/manager/building-services",
    //     children: [
    //         { label: "صفحه خدمات‌دهنده‌ها", to: "/manager/building-services/providers" },
    //         { label: "گزارش خدمات انجام شده", to: "/manager/building-services/reports" },
    //     ],
    // },
    {
        label: "دستیار حقوقی",
        icon: <BookOpen size={20} />, 
        to: "/manager/legal-ai",
    },
    {
        label: "درخواست‌های عضویت",
        icon: <UserPlus size={20} />,
        to: "/manager/membership",
    },
    {
        label: "مدیریت واحد",
        icon: <Home size={20} />,
        to: "/manager/unit-management",
        children: [
            { label: "مدیریت واحدها", to: "/manager/unit-management/units" },
            { label: "درخواست‌ها", to: "/manager/unit-management/requests" },
        ],
    },
    {
        label: "تنظیمات ساختمان",
        icon: <Settings size={20} />,
        to: "/manager/settings",
    },
    // {
    //     label: "رفتار و امتیاز ساکنین",
    //     icon: <User size={20} />,
    //     to: "/manager/resident-behavior",
    //     children: [
    //         { label: "رتبه‌بندی ساختمان و واحد براساس مشارکت", to: "/manager/resident-behavior/ranking" },
    //         { label: "ثبت نظر برای بقیه واحدها", to: "/manager/resident-behavior/feedback" },
    //         { label: "دیدن نظرات خود", to: "/manager/resident-behavior/my-feedback" },
    //     ],
    // },
];
