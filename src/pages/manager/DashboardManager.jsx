/* eslint-disable no-unused-vars */
import { useSelector } from "react-redux";
import DashboardOverview from "../../features/manager/dashboard/DashboardOverview";
import ManagerBuildingsList from "../../features/manager/building/components/ManagerBuildingsList";
import AddBuildingCard from "../../features/manager/building/components/AddBuildingCard";

export default function ManagerDashboard() {
  // const hasBuilding = useSelector((state) => !!state.building?.id); // فرض بر اینکه بعد از ایجاد، building.id ثبت میشه
  // const hasBuilding = false

  const { data: building, status, error, selectedBuildingId } = useSelector((state) => state.building);
  const hasBuilding = !!building?.id;

  return (
    <div className="p-4 space-y-4">
      <div>
        <ManagerBuildingsList />
      </div>

      <div>
        <AddBuildingCard />
      </div>
    </div>
  );
}
