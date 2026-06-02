import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectSelectedBuilding } from "../../building/buildingSlice";
import { fetchBuildings, setSelectedBuilding, fetchBuildingUnits } from "../../building/buildingSlice";

/**
 * Custom hook for managing building-related operations
 */
export const useBuildingManagement = () => {
  const dispatch = useDispatch();
  const building = useSelector(selectSelectedBuilding);
  const buildings = useSelector(state => state.building.data);

  const buildingUnits = useSelector(state => {
    const buildingId = building?.building_id || building?.id;
    return buildingId ? state.building.units[buildingId] || [] : [];
  });

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

  // Fetch building units when building changes
  useEffect(() => {
    if (building?.building_id || building?.id) {
      const buildingId = building.building_id || building.id;
      dispatch(fetchBuildingUnits(buildingId))
        .then(() => {
          // Units loaded successfully
        })
        .catch((error) => {
          console.error("🔥 Fetch building units error:", error);
        });
    }
  }, [dispatch, building?.building_id, building?.id]);

  return {
    building,
    buildings,
    buildingUnits,
  };
};

