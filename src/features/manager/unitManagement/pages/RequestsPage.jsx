import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import RequestBase from "../components/requests/RequestBase";

export default function RequestsPage() {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  // Get building ID from user's current building or first building
  const buildingId = user?.buildings?.[0]?.building_id || null;

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

      <RequestBase buildingId={buildingId} />
    </div>
  )
}
