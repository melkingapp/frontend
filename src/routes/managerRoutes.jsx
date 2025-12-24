import ManagerLayout from "../layout/managerLayout/ManagerLayout";
import DashboardManager from "../pages/manager/DashboardManager";
import Finance from "../pages/manager/Finance";
import CreateBuildingForm from "../features/manager/building/pages/CreateBuildingForm";
import FinanceTransactions from "../features/manager/finance/pages/FinanceTransactions";
import BuildingBalance from "../features/manager/finance/pages/BuildingBalance";
import Notifications from "../pages/manager/Notifications";
import BuildingNews from "../features/manager/notification/pages/BuildingNews";
import ServicesPage from "../features/manager/notification/pages/ServicesPage";
import SurveyPage from "../features/manager/notification/pages/SurveyPage";
import UnitManagement from "../pages/manager/UnitManagement";
import UnitsPage from "../features/manager/unitManagement/pages/UnitsPage";
import TransactionsPage from "../features/manager/unitManagement/pages/TransactionsPage";
import FinancePaymentsPage from "../features/manager/finance/pages/PaymentsPage";
import RequestsPage from "../features/manager/unitManagement/pages/RequestsPage";
import ManagerMembershipPage from "../features/membership/pages/ManagerMembershipPage";
import ConflictReportsPage from "../features/membership/pages/ConflictReportsPage";
import InviteLinksPage from "../features/membership/pages/InviteLinksPage";
import ManagerProfile from "../pages/manager/Profile";
import ManagerSettings from "../pages/manager/Settings";
import LegalAI from "../pages/manager/LegalAI";
import AnnounceCharge from "../pages/manager/AnnounceCharge";
import ProtectedRoute from "../shared/components/shared/ProtectedRoute";

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
            { path: "conflict-reports", element: <ConflictReportsPage /> },
            { path: "invite-links", element: <InviteLinksPage /> },
            { path: "legal-ai", element: <LegalAI /> },
            { path: "profile", element: <ManagerProfile /> },
            { path: "settings", element: <ManagerSettings /> },
        ]
    }
];
