import { lazy } from "react";
import ManagerLayout from "../layout/managerLayout/ManagerLayout";
import ProtectedRoute from "../shared/components/shared/ProtectedRoute";

// Lazy load components
const DashboardManager = lazy(() => import("../pages/manager/DashboardManager"));
const Finance = lazy(() => import("../pages/manager/Finance"));
const CreateBuildingForm = lazy(() => import("../features/manager/building/pages/CreateBuildingForm"));
const FinanceTransactions = lazy(() => import("../features/manager/finance/pages/Transactions").then(module => ({ default: module.TransactionsPage })));
const BuildingBalance = lazy(() => import("../features/manager/finance/pages/Balance").then(module => ({ default: module.BalancePage })));
const Notifications = lazy(() => import("../pages/manager/Notifications"));
const BuildingNews = lazy(() => import("../features/manager/notification/pages/BuildingNews"));
const ServicesPage = lazy(() => import("../features/manager/notification/pages/ServicesPage"));
const SurveyPage = lazy(() => import("../features/manager/notification/pages/SurveyPage"));
const UnitManagement = lazy(() => import("../pages/manager/UnitManagement"));
const UnitsPage = lazy(() => import("../features/manager/unitManagement/pages/UnitsPage"));
const FinancePaymentsPage = lazy(() => import("../features/manager/finance/pages/Payments").then(module => ({ default: module.PaymentsPage })));
const RequestsPage = lazy(() => import("../features/manager/unitManagement/pages/RequestsPage"));
const ManagerMembershipPage = lazy(() => import("../features/membership/pages/ManagerMembershipPage"));
const ManagerProfile = lazy(() => import("../pages/manager/Profile"));
const ManagerSettings = lazy(() => import("../pages/manager/Settings"));
const LegalAI = lazy(() => import("../pages/manager/LegalAI"));
const AnnounceCharge = lazy(() => import("../pages/manager/AnnounceCharge"));

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
            { path: "membership", element: <ManagerMembershipPage /> },
            { path: "legal-ai", element: <LegalAI /> },
            { path: "profile", element: <ManagerProfile /> },
            { path: "settings", element: <ManagerSettings /> },
        ]
    }
];
