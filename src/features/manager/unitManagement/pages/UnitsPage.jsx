import { ChevronLeft, HomeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import UnitBase from "../components/units/UnitBase";
import CreateUnitModal from "../components/units/CreateUnitModal";
import FloatingActionButton from "../../../../shared/components/shared/feedback/FloatingActionButton";
import { selectSelectedBuilding } from "../../building/buildingSlice";

export default function UnitsPage() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const selectedBuilding = useSelector(selectSelectedBuilding);

  // Get building ID from selected building
  const buildingId = selectedBuilding?.building_id || selectedBuilding?.id || null;
  
  console.log("🔥 UnitsPage - Selected building:", selectedBuilding);
  console.log("🔥 UnitsPage - Building ID:", buildingId);

  const handleCreateUnit = () => setActiveModal("createUnit");

  return (
    <div className="p-2 space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300
                 text-gray-700 bg-gradient-to-r from-gray-50 to-white shadow-sm
                 hover:shadow-md hover:from-white hover:to-gray-50
                 active:scale-95 transition-all duration-200 font-medium"
        >
          <ChevronLeft size={20} className="text-gray-600" />
          بازگشت
        </button>
      </div>

      <UnitBase buildingId={buildingId} showCreateButton={false} />

      <FloatingActionButton
        color="bg-melkingDarkBlue"
        items={[
          {
            key: "createUnit",
            label: "ایجاد واحد",
            icon: <HomeIcon className="w-4 h-4" />,
            onClick: handleCreateUnit,
          },
        ]}
      />

      <CreateUnitModal
        isOpen={activeModal === "createUnit"}
        onClose={() => setActiveModal(null)}
        buildingId={buildingId}
      />
    </div>
  )
}
