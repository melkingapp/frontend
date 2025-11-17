import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ChevronLeft, ReceiptText } from "lucide-react";
import UnitTransactionsList from "../components/transactions/UnitTransactionsList";
import { fetchBuildings } from "../../building/buildingSlice";

export default function TransactionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { selectedBuildingId, data: buildings, loading: buildingsLoading } = useSelector(state => state.building);
  const initialUnitNumber = location.state?.unitNumber || "";

  const [unitNumber, setUnitNumber] = useState(initialUnitNumber);
  const [error, setError] = useState("");

  // Get building ID from selected building or first building
  const buildingId = selectedBuildingId || (buildings && buildings.length > 0 ? buildings[0].building_id : null);

  // Fetch buildings if not available
  useEffect(() => {
    if (!buildings || buildings.length === 0) {
      dispatch(fetchBuildings());
    }
  }, [dispatch, buildings]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!unitNumber.trim()) {
      setError("وارد کردن شماره واحد الزامی است!");
      return;
    }
    setError("");
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-gray-100 space-y-6">
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

      {/* تیتر اصلی */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
        <ReceiptText size={20} /> تراکنش‌های واحد
      </h1>

      {/* فرم جستجو */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-3 my-6 w-full max-w-md mx-auto"
      >
        <input
          type="text"
          placeholder="شماره واحد را وارد کنید"
          value={unitNumber}
          onChange={(e) => setUnitNumber(e.target.value)}
          className={`flex-1 px-4 py-3 rounded-lg border focus:outline-none transition placeholder-gray-400
        ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-melkingDarkBlue focus:border-melkingDarkBlue"}
      `}
        />
        <button
          type="submit"
          className="px-5 py-3 bg-melkingDarkBlue text-white rounded-lg hover:bg-[#0d254d] active:scale-95 transition transform font-medium shadow-md"
        >
          جستجو
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-sm text-center sm:text-left mb-4">{error}</p>
      )}

      {unitNumber.trim() && !error && (
        <div className="mt-4">
          <UnitTransactionsList unitNumber={unitNumber} buildingId={buildingId} />
        </div>
      )}
    </div>
  );
}