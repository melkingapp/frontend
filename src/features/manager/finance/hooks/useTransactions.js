import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { selectSelectedBuilding } from "../../building/buildingSlice";
import { fetchTransactions, fetchCurrentFundBalance, clearTransactions } from "../store/slices/financeSlice";
import { fetchBuildings, setSelectedBuilding, fetchBuildingUnits } from "../../building/buildingSlice";
import { getUnitFinancialTransactions, getUnitFinancialTransactionsForResidents } from "../../../../shared/services/transactionsService";

export function useTransactions() {
  const dispatch = useDispatch();
  const building = useSelector(selectSelectedBuilding);
  const buildings = useSelector(state => state.building.data);
  const currentFundBalance = useSelector(state => state.finance.currentFundBalance);
  const user = useSelector(state => state.auth.user);
  const isManager = user?.role === 'manager';
  
  const [viewMode, setViewMode] = useState('building');
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [unitTransactions, setUnitTransactions] = useState(null);
  const [unitTransactionsLoading, setUnitTransactionsLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);

  const buildingUnits = useSelector(state => {
    const buildingId = building?.building_id || building?.id;
    if (!buildingId) return [];
    const unitsData = state.building.units[buildingId];
    if (Array.isArray(unitsData)) {
      return unitsData;
    } else if (unitsData && unitsData.units) {
      return unitsData.units;
    }
    return [];
  });

  const userUnits = buildingUnits.filter(unit => 
    unit.phone_number === user?.phone_number || 
    unit.tenant_phone_number === user?.phone_number ||
    (unit.owner && unit.owner.id === user?.id) ||
    (unit.owner && unit.owner.username === user?.username)
  );

  // Load buildings if not loaded
  useEffect(() => {
    if (buildings.length === 0) {
      dispatch(fetchBuildings());
    }
  }, [dispatch, buildings.length]);

  // Auto-select first building if none selected
  useEffect(() => {
    if (buildings.length > 0 && !building) {
      const firstBuilding = buildings[0];
      dispatch(setSelectedBuilding(firstBuilding.building_id || firstBuilding.id));
    }
  }, [dispatch, buildings.length, building]);

  // Fetch current fund balance when building changes
  useEffect(() => {
    if (building?.building_id) {
      dispatch(fetchCurrentFundBalance(building.building_id));
    }
  }, [dispatch, building?.building_id]);

  // Fetch building units when building changes or view mode changes to unit or when buildingUnits are empty
  useEffect(() => {
    if (building?.building_id && buildingUnits.length === 0) {
      dispatch(fetchBuildingUnits(building.building_id));
    }
  }, [dispatch, building?.building_id, buildingUnits.length]);

  // Clear transactions when building changes (to avoid showing old data)
  useEffect(() => {
    if (viewMode === 'building' || viewMode === 'charge') {
      dispatch(clearTransactions());
    }
  }, [dispatch, building?.building_id, viewMode]);

  // Load transactions when building changes (building or charge view)
  useEffect(() => {
    if (viewMode !== 'building' && viewMode !== 'charge') return;
    
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return;

    const filters = {};
    if (building?.building_id) {
      filters.building_id = building.building_id;
    }
    // Note: We fetch all transactions and filter charges locally for better UX

    if (filters.building_id) {
      dispatch(fetchTransactions(filters))
        .catch((error) => {
          console.error("🔥 Fetch transactions error:", error);
        });
    } else if (buildings.length > 0 && !building) {
      dispatch(fetchTransactions(filters))
        .catch((error) => {
          console.error("🔥 Fetch all transactions error:", error);
        });
    }
  }, [dispatch, building?.building_id, buildings.length, viewMode]);

  // Auto-select user's unit when switching to unit view mode
  useEffect(() => {
    if (viewMode === 'unit' && !selectedUnitId && userUnits.length > 0) {
      const userUnitId = userUnits[0].units_id || userUnits[0].id;
      setSelectedUnitId(userUnitId);
    }
  }, [viewMode, userUnits, selectedUnitId]);

  // Fetch unit financial transactions when unit is selected
  useEffect(() => {
    if (viewMode === 'unit' && selectedUnitId) {
      setUnitTransactionsLoading(true);
      const fetchFn = isManager
        ? getUnitFinancialTransactions
        : getUnitFinancialTransactionsForResidents;

      fetchFn(selectedUnitId, dateRange?.from, dateRange?.to)
        .then((response) => {
          setUnitTransactions(response);
        })
        .catch((error) => {
          console.error("❌ Error fetching unit transactions:", error);
          const backendError = error.response?.data?.error;
          if (backendError) {
            toast.error(backendError);
          } else {
            toast.error("خطا در دریافت گردش مالی واحد");
          }
          setUnitTransactions(null);
        })
        .finally(() => {
          setUnitTransactionsLoading(false);
        });
    } else if (viewMode === 'building') {
      setUnitTransactions(null);
    }
  }, [selectedUnitId, viewMode, dateRange, isManager, building?.building_id]);

  // Reset unit transactions when building changes (to avoid showing old data)
  useEffect(() => {
    if (viewMode === 'unit') {
      setUnitTransactions(null);
      setSelectedUnitId(null);
    }
  }, [building?.building_id, viewMode]);

  return {
    building,
    buildings,
    currentFundBalance,
    isManager,
    buildingUnits,
    userUnits,
    viewMode,
    setViewMode,
    selectedUnitId,
    setSelectedUnitId,
    unitTransactions,
    unitTransactionsLoading,
    dateRange,
    setDateRange,
  };
}

