import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ManagerHeader from "../../shared/components/headers/managerHeader/ManagerHeader";
import ManagerSidebar from "../../shared/components/headers/managerHeader/ManagerSidebar";
import { navItemsManager } from "../../constants/navItemsManager";
import { fetchBuildings, selectSelectedBuilding } from "../../features/manager/building/buildingSlice";

export default function ManagerLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const dispatch = useDispatch();
    const selectedBuilding = useSelector(selectSelectedBuilding);

    useEffect(() => {
        dispatch(fetchBuildings());
    }, [dispatch]);

    // Auto-open sidebar when a building is selected
    useEffect(() => {
        if (selectedBuilding) {
            setSidebarOpen(true);
        }
    }, [selectedBuilding]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <ManagerHeader onOpenSidebar={() => setSidebarOpen(true)} />

            {/* Content */}
            <div className="flex flex-1 pt-1">
                <ManagerSidebar
                    navItems={navItemsManager}
                    sidebarOpen={sidebarOpen}
                    onCloseSidebar={() => setSidebarOpen(false)}
                />
                <main className="flex-1 p-4 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

