<<<<<<< SEARCH
import {
    selectResidentRequests,
    setSelectedBuilding,
    fetchResidentRequests,
} from "../../../../features/resident/building/residentBuildingSlice";
import { fetchMembershipRequests } from "../../../../features/resident/building/residentBuildingSlice";
import { useResidentUnitData } from "../../../../features/resident/building/hooks/useResidentUnitData";
=======
import {
    selectResidentRequests,
    setSelectedBuilding,
    fetchResidentRequests,
} from "../../../../features/resident/building/residentBuildingSlice";
import { useResidentUnitData } from "../../../../features/resident/building/hooks/useResidentUnitData";
>>>>>>> REPLACE
<<<<<<< SEARCH
    // Auto-refresh membership requests every 30 seconds for pending requests
    useEffect(() => {
        const hasPendingRequests = membershipRequests.some(req => req.status === 'pending');
        if (!hasPendingRequests) return;

        const interval = setInterval(() => {
            dispatch(fetchMembershipRequests());
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [membershipRequests, dispatch]);
=======
>>>>>>> REPLACE
