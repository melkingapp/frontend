import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import ResidentHeader from "../../shared/components/headers/residentHeader/ResidentHeader";
import ResidentSidebar from "../../shared/components/headers/residentHeader/ResidentSidebar";
import { navItemsResident } from "../../constants/navItemsResident";
import { selectSelectedResidentBuilding } from "../../features/resident/building/residentBuildingSlice";

export default function ResidentLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const selectedBuilding = useSelector(selectSelectedResidentBuilding);

    // Auto-open sidebar when a building is selected
    useEffect(() => {
        if (selectedBuilding) {
            setSidebarOpen(true);
        }
    }, [selectedBuilding]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <ResidentHeader onOpenSidebar={() => setSidebarOpen(true)} />

            {/* Content */}
            <div className="flex flex-1 pt-1">
                <ResidentSidebar
                    navItems={navItemsResident}
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
