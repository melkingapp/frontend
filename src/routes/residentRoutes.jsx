import ResidentLayout from "../layout/residentLayout/ResidentLayout";
import DashboardResident from "../pages/resident/DashboardResident";
import Finance from "../pages/resident/Finance";
import FinanceTransactions from "../features/resident/finance/pages/FinanceTransactions";
import BuildingBalance from "../features/resident/finance/pages/BuildingBalance";
import Notifications from "../pages/resident/Notifications";
import BuildingNews from "../features/resident/notification/pages/BuildingNews";
import ServicesPage from "../features/resident/notification/pages/ServicesPage";
import SurveyPage from "../features/resident/notification/pages/SurveyPage";
import UnitManagement from "../pages/resident/UnitManagement";
import UnitsPage from "../features/resident/unitManagement/pages/UnitsPage";
import RequestsPage from "../features/resident/unitManagement/pages/RequestsPage";
import TransactionsPage from "../features/resident/unitManagement/pages/TransactionsPage";
import MembershipRequestsPage from "../features/membership/pages/MembershipRequestsPage";
import MembershipApprovalPage from "../features/resident/unitManagement/pages/MembershipApprovalPage";
import ResidentProfile from "../pages/resident/Profile";
import ResidentSettings from "../pages/resident/Settings";
import ResidentLegalAI from "../pages/resident/LegalAI";
import ProtectedRoute from "../shared/components/shared/ProtectedRoute";

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
            { path: "membership-approval", element: <MembershipApprovalPage /> },
            { path: "profile", element: <ResidentProfile /> },
            { path: "settings", element: <ResidentSettings /> },
            { path: "legal-ai", element: <ResidentLegalAI /> },
        ]
    }
];
