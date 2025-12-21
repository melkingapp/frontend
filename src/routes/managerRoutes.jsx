import React from 'react';
import ProtectedRoute from "../shared/components/shared/ProtectedRoute";

const ManagerLayout = React.lazy(() => import("../layout/managerLayout/ManagerLayout"));
const DashboardManager = React.lazy(() => import("../pages/manager/DashboardManager"));
const Finance = React.lazy(() => import("../pages/manager/Finance"));
const CreateBuildingForm = React.lazy(() => import("../features/manager/building/pages/CreateBuildingForm"));
const FinanceTransactions = React.lazy(() => import("../features/manager/finance/pages/FinanceTransactions"));
const BuildingBalance = React.lazy(() => import("../features/manager/finance/pages/BuildingBalance"));
const Notifications = React.lazy(() => import("../pages/manager/Notifications"));
const BuildingNews = React.lazy(() => import("../features/manager/notification/pages/BuildingNews"));
const ServicesPage = React.lazy(() => import("../features/manager/notification/pages/ServicesPage"));
const SurveyPage = React.lazy(() => import("../features/manager/notification/pages/SurveyPage"));
const UnitManagement = React.lazy(() => import("../pages/manager/UnitManagement"));
const UnitsPage = React.lazy(() => import("../features/manager/unitManagement/pages/UnitsPage"));
const TransactionsPage = React.lazy(() => import("../features/manager/unitManagement/pages/TransactionsPage"));
const FinancePaymentsPage = React.lazy(() => import("../features/manager/finance/pages/PaymentsPage"));
const RequestsPage = React.lazy(() => import("../features/manager/unitManagement/pages/RequestsPage"));
const ManagerMembershipPage = React.lazy(() => import("../features/membership/pages/ManagerMembershipPage"));
const ManagerProfile = React.lazy(() => import("../pages/manager/Profile"));
const ManagerSettings = React.lazy(() => import("../pages/manager/Settings"));
const LegalAI = React.lazy(() => import("../pages/manager/LegalAI"));
const AnnounceCharge = React.lazy(() => import("../pages/manager/AnnounceCharge"));


export const managerRoutes = [
    {
        path: "manager",
        element: (
            <ProtectedRoute allowedRoles={['manager']}>
                <ManagerLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <DashboardManager /> },
            { path: "dashboard", element: <DashboardManager /> },
            { path: "create-building", element: <CreateBuildingForm /> },
            { path: "finance", element: <Finance /> },
            { path: "finance-reports", element: <FinanceTransactions /> },
            { path: "finance/balance", element: <BuildingBalance /> },
            { path: "finance/payments", element: <FinancePaymentsPage /> },
            { path: "announce-charge", element: <AnnounceCharge /> },
            { path: "notifications", element: <Notifications /> },
            { path: "notifications/news", element: <BuildingNews /> },
            { path: "notifications/services", element: <ServicesPage /> },
            { path: "notifications/survey", element: <SurveyPage /> },
            { path: "unit-management", element: <UnitManagement /> },
            { path: "unit-management/units", element: <UnitsPage /> },
            { path: "unit-management/requests", element: <RequestsPage /> },
            { path: "unit-management/transactions", element: <TransactionsPage /> },
            { path: "membership", element: <ManagerMembershipPage /> },
            { path: "legal-ai", element: <LegalAI /> },
            { path: "profile", element: <ManagerProfile /> },
            { path: "settings", element: <ManagerSettings /> },
        ]
    }
];
