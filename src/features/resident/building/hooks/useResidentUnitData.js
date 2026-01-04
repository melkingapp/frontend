import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    selectSelectedResidentBuilding,
    selectApprovedBuildings,
    selectResidentBuildingLoading,
    selectResidentBuildingError,
    refreshApprovedBuildings,
    maintainApprovedBuildings,
} from "../residentBuildingSlice";
import {
    selectMembershipRequests,
    fetchMembershipRequests,
} from "../../../membership/membershipSlice";

/**
 * Hook مرکزی برای مدیریت اطلاعات واحد کاربر
 * 
 * این hook:
 * - از fetch تکراری جلوگیری می‌کند
 * - selectedBuilding را به صورت reactive برمی‌گرداند
 * - approvedUnits را از membershipRequests محاسبه می‌کند
 * 
 * @returns {Object} { selectedBuilding, approvedUnits, approvedBuildings, membershipRequests, loading, error }
 */
export function useResidentUnitData() {
    const dispatch = useDispatch();

    // Get data from Redux
    const selectedBuilding = useSelector(selectSelectedResidentBuilding);
    const approvedBuildings = useSelector(selectApprovedBuildings);
    const membershipRequests = useSelector(selectMembershipRequests);
    const loading = useSelector(selectResidentBuildingLoading);
    const error = useSelector(selectResidentBuildingError);

    // Fetch membership requests only once (if not already loaded)
    useEffect(() => {
        if (membershipRequests.length === 0) {
            dispatch(fetchMembershipRequests());
        }
    }, [dispatch, membershipRequests.length]);

    // Fetch approved buildings only once (if not already loaded)
    useEffect(() => {
        if (approvedBuildings.length === 0) {
            dispatch(refreshApprovedBuildings()).catch(() => {
                console.log('🔄 API failed, using maintain action...');
                dispatch(maintainApprovedBuildings());
            });
        }
    }, [dispatch, approvedBuildings.length]);

    // Calculate approvedUnits from membershipRequests
    const approvedUnits = useMemo(() => {
        const approvedRequests = membershipRequests.filter(req => 
            req.status === 'approved' || 
            req.status === 'owner_approved' || 
            req.status === 'manager_approved'
        );
        
        // گروه‌بندی درخواست‌ها بر اساس ساختمان و واحد
        const unitGroups = {};
        
        approvedRequests.forEach(request => {
            const key = `${request.building}-${request.unit_number}`;
            if (!unitGroups[key]) {
                unitGroups[key] = [];
            }
            unitGroups[key].push(request);
        });
        
        // برای هر واحد، نقش مالک را اولویت بده
        const uniqueUnits = [];
        Object.values(unitGroups).forEach(requests => {
            // اگر نقش مالک وجود دارد، آن را انتخاب کن
            const ownerRequest = requests.find(req => req.role === 'owner');
            if (ownerRequest) {
                uniqueUnits.push(ownerRequest);
            } else {
                // در غیر این صورت، اولین درخواست را انتخاب کن
                uniqueUnits.push(requests[0]);
            }
        });
        
        return uniqueUnits;
    }, [membershipRequests]);

    return {
        selectedBuilding,
        approvedUnits,
        approvedBuildings,
        membershipRequests,
        loading,
        error,
    };
}

