import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setSelectedBuilding, selectSelectedResidentBuilding } from "../residentBuildingSlice";

export function useBuildingAutoSelection(buildings) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (buildings.length > 0) {
      // Check if this is the first time loading (no saved selection in localStorage)
      const savedBuilding = localStorage.getItem('selectedResidentBuilding');
      if (!savedBuilding) {
        dispatch(setSelectedBuilding(buildings[0]));
      }
    }
  }, [buildings.length, dispatch]);
}

export function useBuildingValidation(buildings, selectedBuilding) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedBuilding && buildings.length > 0) {
      // Check if selected building still exists in current buildings list
      const buildingExists = buildings.find(b =>
        b.id === selectedBuilding.id ||
        (b.building_id === selectedBuilding.building_id &&
         b.unit_info?.unit_number === selectedBuilding.unit_info?.unit_number)
      );

      if (!buildingExists) {
        // Selected building no longer exists, try to find a similar one
        const similarBuilding = buildings.find(b =>
          b.building_id === selectedBuilding.building_id
        );

        if (similarBuilding) {
          // Found a building with same building_id, update selection
          dispatch(setSelectedBuilding(similarBuilding));
        } else {
          // No similar building found, clear selection
          dispatch(setSelectedBuilding(null));
        }
      }
    }
  }, [buildings, selectedBuilding, dispatch]);
}
