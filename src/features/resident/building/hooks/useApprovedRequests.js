import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectMembershipRequests } from "../../../membership/membershipSlice";

export function useApprovedRequests() {
  const requests = useSelector(selectMembershipRequests);

  const approvedRequests = useMemo(() => {
    return requests.filter(req => {
      // فقط درخواست‌های تایید شده را برگردان
      const isApproved = req.status === 'approved' ||
        req.status === 'owner_approved' ||
        req.status === 'manager_approved';
      
      // درخواست‌های رد شده را حذف کن
      const isRejected = req.status === 'rejected';
      
      return isApproved && !isRejected;
    });
  }, [requests]);

  return approvedRequests;
}

export function useApprovedBuildings() {
  const approvedRequests = useApprovedRequests();

  const buildings = useMemo(() => {
    // Group requests by building and unit
    const unitGroups = {};

    approvedRequests.forEach(request => {
      const key = `${request.building}-${request.unit_number}`;
      if (!unitGroups[key]) {
        unitGroups[key] = [];
      }
      unitGroups[key].push(request);
    });

    // For each unit, prioritize owner role
    const uniqueUnits = [];
    Object.values(unitGroups).forEach(requests => {
      const ownerRequest = requests.find(req => req.role === 'owner');
      if (ownerRequest) {
        uniqueUnits.push(ownerRequest);
      } else {
        uniqueUnits.push(requests[0]);
      }
    });

    return uniqueUnits.map((request, index) => ({
      id: `${request.building}-${request.unit_number}`,
      building_id: request.building,
      title: request.building_title,
      building_code: request.building_code,
      unit_info: {
        unit_number: request.unit_number,
        floor: request.floor,
        area: request.area,
        resident_count: request.resident_count,
        has_parking: request.has_parking,
        parking_count: request.parking_count,
        role: request.role
      }
    }));
  }, [approvedRequests]);

  return buildings;
}

export function useAllApprovedUnits() {
  const approvedRequests = useApprovedRequests();

  const units = useMemo(() => {
    return approvedRequests.map((request, index) => ({
      id: `${request.building || 'unknown'}-${request.unit_number || 'unknown'}-${request.request_id || index}`,
      building_id: request.building,
      title: request.building_title,
      building_code: request.building_code,
      request_id: request.request_id,
      unit_info: {
        unit_number: request.unit_number,
        floor: request.floor,
        area: request.area,
        resident_count: request.resident_count,
        has_parking: request.has_parking,
        parking_count: request.parking_count,
        role: request.role
      }
    }));
  }, [approvedRequests]);

  return units;
}
