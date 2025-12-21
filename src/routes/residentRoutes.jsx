import React from 'react';
import ProtectedRoute from "../shared/components/shared/ProtectedRoute";

const ResidentLayout = React.lazy(() => import("../layout/residentLayout/ResidentLayout"));
const DashboardResident = React.lazy(() => import("../pages/resident/DashboardResident"));
const Finance = React.lazy(() => import("../pages/resident/Finance"));
const FinanceTransactions = React.lazy(() => import("../features/resident/finance/pages/FinanceTransactions"));
const BuildingBalance = React.lazy(() => import("../features/resident/finance/pages/BuildingBalance"));
const Notifications = React.lazy(() => import("../pages/resident/Notifications"));
const BuildingNews = React.lazy(() => import("../features/resident/notification/pages/BuildingNews"));
const ServicesPage = React.lazy(() => import("../features/resident/notification/pages/ServicesPage"));
const SurveyPage = React.lazy(() => import("../features/resident/notification/pages/SurveyPage"));
const UnitManagement = React.lazy(() => import("../pages/resident/UnitManagement"));
const UnitsPage = React.lazy(() => import("../features/resident/unitManagement/pages/UnitsPage"));
const RequestsPage = React.lazy(() => import("../features/resident/unitManagement/pages/RequestsPage"));
const TransactionsPage = React.lazy(() => import("../features/resident/unitManagement/pages/TransactionsPage"));
const MembershipRequestsPage = React.lazy(() => import("../features/membership/pages/MembershipRequestsPage"));
const ResidentProfile = React.lazy(() => import("../pages/resident/Profile"));
const ResidentSettings = React.lazy(() => import("../pages/resident/Settings"));
const ResidentLegalAI = React.lazy(() => import("../pages/resident/LegalAI"));


export const residentRoutes = [
    {
        path: "resident",
        element: (
            <ProtectedRoute allowedRoles={['resident']}>
                <ResidentLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <DashboardResident /> },
            { path: "dashboard", element: <DashboardResident /> },
            { path: "finance", element: <Finance /> },
            { path: "finance-reports", element: <FinanceTransactions /> },
            { path: "finance/balance", element: <BuildingBalance /> },
            // بررسی پرداخت حذف شده - فقط برای مدیر ساختمان
            { path: "notifications", element: <Notifications /> },
            { path: "notifications/news", element: <BuildingNews /> },
            { path: "notifications/services", element: <ServicesPage /> },
            { path: "notifications/survey", element: <SurveyPage /> },
            { path: "unit-management", element: <UnitManagement /> },
            { path: "unit-management/units", element: <UnitsPage /> },
            { path: "unit-management/requests", element: <RequestsPage /> },
            { path: "unit-management/transactions", element: <TransactionsPage /> },
            { path: "membership", element: <MembershipRequestsPage /> },
            { path: "profile", element: <ResidentProfile /> },
            { path: "settings", element: <ResidentSettings /> },
            { path: "legal-ai", element: <ResidentLegalAI /> },
        ]
    }
];
