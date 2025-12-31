import { useState, useEffect, useMemo, useRef } from "react";
import { FileText, Loader2, RefreshCw, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import RequestItem from "../../../manager/unitManagement/components/requests/RequestItem";
import { fetchRequests, clearError } from "../../../manager/unitManagement/slices/requestsSlice";
import { selectSelectedBuilding } from "../../../manager/building/buildingSlice";
import { selectSelectedResidentBuilding } from "../../building/residentBuildingSlice";
import CreateRequestModal from "../../../manager/unitManagement/components/requests/CreateRequestModal";
import { fetchMembershipRequests, selectMembershipRequests, selectMembershipLoading } from "../../../membership/membershipSlice";
import { useApprovedBuildings, useAllApprovedUnits } from "../../building/hooks/useApprovedRequests";
import { useBuildingAutoSelection } from "../../building/hooks/useBuildingSelection";

export default function RequestsBase({ requests: propRequests, limit }) {
    const dispatch = useDispatch();
    const managerBuilding = useSelector(selectSelectedBuilding);
    const residentBuilding = useSelector(selectSelectedResidentBuilding);
    const { requests: reduxRequests, loading, error } = useSelector(state => state.requests);
    const membershipRequests = useSelector(selectMembershipRequests);
    const membershipLoading = useSelector(selectMembershipLoading);
    const { user } = useSelector(state => state.auth);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Get approved buildings and units for resident
    const approvedBuildings = useApprovedBuildings();
    const allApprovedUnits = useAllApprovedUnits();
    
    // Auto-select building if needed (same as ResidentBuildingsList)
    useBuildingAutoSelection(allApprovedUnits);
    
    // Get approved membership requests
    const approvedMembershipRequests = useMemo(() => {
        return membershipRequests.filter(req =>
            req.status === 'approved' ||
            req.status === 'owner_approved' ||
            req.status === 'manager_approved'
        );
    }, [membershipRequests]);
    
    // Get building ID based on user role
    const buildingId = useMemo(() => {
        if (user?.role === 'manager') {
            return managerBuilding?.building_id || managerBuilding?.id || null;
        } else if (user?.role === 'resident') {
            // Priority 1: Direct from approved membership requests (most reliable)
            if (approvedMembershipRequests.length > 0) {
                const firstRequest = approvedMembershipRequests[0];
                // Try building field (could be building_id or building object)
                if (firstRequest.building) {
                    // If building is a number, use it directly
                    if (typeof firstRequest.building === 'number') {
                        return firstRequest.building;
                    }
                    // If building is an object with id, use it
                    if (typeof firstRequest.building === 'object' && firstRequest.building.id) {
                        return firstRequest.building.id;
                    }
                }
                // Try building_id field
                if (firstRequest.building_id) {
                    return firstRequest.building_id;
                }
            }
            
            // Priority 2: residentBuilding from Redux (direct building_id)
            if (residentBuilding?.building_id && residentBuilding.building_id !== 'undefined' && residentBuilding.building_id !== null) {
                return residentBuilding.building_id;
            }
            
            // Priority 3: Extract building_id from residentBuilding.id (format: "building_id-unit_number")
            if (residentBuilding?.id) {
                if (typeof residentBuilding.id === 'number') {
                    return residentBuilding.id;
                } else if (typeof residentBuilding.id === 'string') {
                    const parts = residentBuilding.id.split('-');
                    if (parts.length > 0 && parts[0] && parts[0] !== 'undefined' && !isNaN(parts[0])) {
                        return parseInt(parts[0], 10);
                    }
                }
            }
            
            // Priority 4: allApprovedUnits (derived from membership requests)
            if (allApprovedUnits.length > 0) {
                const unit = allApprovedUnits.find(u => u.building_id && u.building_id !== 'undefined' && u.building_id !== null);
                if (unit?.building_id) {
                    return unit.building_id;
                }
            }
            
            // Priority 5: approvedBuildings (fallback)
            if (approvedBuildings.length > 0) {
                const building = approvedBuildings.find(b => b.building_id && b.building_id !== 'undefined' && b.building_id !== null);
                if (building?.building_id) {
                    return building.building_id;
                }
            }
        }
        return null;
    }, [user?.role, managerBuilding, residentBuilding, approvedBuildings, allApprovedUnits, approvedMembershipRequests]);

    // Get user's approved units to match with requests
    const userApprovedUnits = useMemo(() => {
        if (user?.role === 'resident' && allApprovedUnits.length > 0) {
            const userPhone = user?.phone_number || user?.phone || user?.username;
            const userPhoneStr = userPhone ? userPhone.toString().trim() : '';
            
            return allApprovedUnits.filter(unit => {
                // Match by phone_number or tenant_phone_number (same logic as CreateRequestModal)
                if (userPhoneStr) {
                    if (unit.phone_number) {
                        const unitPhone = unit.phone_number.toString().trim();
                        if (unitPhone === userPhoneStr) {
                            return true;
                        }
                    }
                    if (unit.tenant_phone_number) {
                        const tenantPhone = unit.tenant_phone_number.toString().trim();
                        if (tenantPhone === userPhoneStr) {
                            return true;
                        }
                    }
                }
                return false;
            });
        }
        return [];
    }, [allApprovedUnits, user?.role, user?.phone_number, user?.phone, user?.username]);
    
    // Get user's unit IDs for filtering requests
    const userUnitIds = useMemo(() => {
        return userApprovedUnits.map(unit => {
            // Try different ID fields
            return unit.units_id || unit.unit_id || unit.id || null;
        }).filter(id => id !== null);
    }, [userApprovedUnits]);
    
    // Use Redux data if available, otherwise fall back to props
    const allRequests = reduxRequests.length > 0 ? reduxRequests : (propRequests || []);
    
    // Filter requests to show only user's requests for residents
    const dataSource = useMemo(() => {
        if (user?.role === 'resident' && allRequests.length > 0) {
            const userPhone = user?.phone_number || user?.phone || user?.username;
            const userPhoneStr = userPhone ? userPhone.toString().trim() : '';
            const userId = user?.id;
            
            return allRequests.filter(request => {
                // Method 1: Check by unit_id (match with user's approved units)
                if (request.unit_id && userUnitIds.length > 0) {
                    const requestUnitId = request.unit_id;
                    if (userUnitIds.includes(requestUnitId)) {
                        return true;
                    }
                }
                
                // Method 2: Check by unit object's id
                if (request.unit) {
                    const unit = typeof request.unit === 'object' ? request.unit : null;
                    if (unit) {
                        const unitId = unit.units_id || unit.unit_id || unit.id;
                        if (unitId && userUnitIds.includes(unitId)) {
                            return true;
                        }
                        
                        // Check unit owner/tenant phone
                        if (userPhoneStr) {
                            if (unit.phone_number) {
                                const unitPhone = unit.phone_number.toString().trim();
                                if (unitPhone === userPhoneStr) {
                                    return true;
                                }
                            }
                            if (unit.tenant_phone_number) {
                                const tenantPhone = unit.tenant_phone_number.toString().trim();
                                if (tenantPhone === userPhoneStr) {
                                    return true;
                                }
                            }
                        }
                    }
                }
                
                // Method 3: Check by user_id (if available in request)
                if (request.user_id && userId && request.user_id === userId) {
                    return true;
                }
                
                // Method 4: Check by phone_number in request (if available)
                if (request.phone_number && userPhoneStr) {
                    const requestPhone = request.phone_number.toString().trim();
                    if (requestPhone === userPhoneStr) {
                        return true;
                    }
                }
                
                return false;
            });
        }
        // For managers, show all requests
        return allRequests;
    }, [allRequests, user?.role, user?.id, user?.phone_number, user?.phone, user?.username, userUnitIds]);
    
    // Sort by created_at (from API) or createdAt (from props)
    const sorted = [...dataSource].sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt);
        const dateB = new Date(b.created_at || b.createdAt);
        return dateB - dateA;
    });
    
    const displayed = limit ? sorted.slice(0, limit) : sorted;

    // Fetch membership requests to get approved buildings (only once)
    useEffect(() => {
        if (user?.role === 'resident') {
            dispatch(fetchMembershipRequests());
        }
    }, [dispatch, user?.role]);

    // Track last fetched buildingId to prevent duplicate requests (works with React Strict Mode)
    const lastFetchedBuildingId = useRef(null);
    
    // Clear error when buildingId changes or is invalid
    useEffect(() => {
        if (!buildingId || typeof buildingId !== 'number' || isNaN(buildingId)) {
            if (error) {
                dispatch(clearError());
            }
        }
    }, [dispatch, buildingId]); // Don't include error to avoid infinite loops
    
    // Fetch requests when component mounts (prevent duplicate calls)
    useEffect(() => {
        // Only fetch if buildingId is valid (not null/undefined) and is a number
        // And it's different from the last fetched buildingId
        if (buildingId && typeof buildingId === 'number' && !isNaN(buildingId)) {
            if (lastFetchedBuildingId.current !== buildingId) {
                console.log('🔥 RequestsBase - Fetching requests for buildingId:', buildingId);
                lastFetchedBuildingId.current = buildingId;
                // Clear error before fetching
                dispatch(clearError());
                dispatch(fetchRequests(buildingId));
            } else {
                console.log('🔥 RequestsBase - Skipping duplicate fetch for buildingId:', buildingId);
            }
        } else {
            console.log('🔥 RequestsBase - Skipping fetch, buildingId is invalid:', buildingId);
            // Only reset if buildingId is explicitly null/undefined, not if it's still loading
            if (buildingId === null || buildingId === undefined) {
                lastFetchedBuildingId.current = null;
            }
        }
        
        // Cleanup function to prevent race conditions in Strict Mode
        return () => {
            // Don't reset lastFetchedBuildingId on cleanup to prevent duplicate requests
            // in React Strict Mode (which unmounts and remounts components)
        };
    }, [dispatch, buildingId]);

    const handleRefresh = () => {
        if (buildingId) {
            // Clear error before retrying
            dispatch(clearError());
            dispatch(fetchRequests(buildingId));
        }
    };

    const handleCreateSuccess = () => {
        // Refresh requests list after creating
        if (buildingId) {
            dispatch(fetchRequests(buildingId));
        }
    };

    // Show loading state:
    // 1. If membership requests are loading (needed to calculate buildingId for residents)
    // 2. If buildingId is not yet calculated for residents (waiting for membership requests)
    // 3. If requests are loading and we have a buildingId
    const isWaitingForBuildingId = user?.role === 'resident' && !buildingId && (membershipLoading || membershipRequests.length === 0);
    const isLoadingRequests = loading && displayed.length === 0 && buildingId;
    
    // Don't show error if we're still waiting for buildingId to be calculated
    const shouldShowError = error && buildingId && !isWaitingForBuildingId;
    
    if (membershipLoading || isWaitingForBuildingId || isLoadingRequests) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="mr-2 text-gray-600">در حال بارگذاری...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">درخواست‌ها</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 
                                 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        بروزرسانی
                    </button>
                    {buildingId && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-melkingDarkBlue text-white rounded-lg hover:bg-melkingGold hover:text-melkingDarkBlue transition"
                        >
                            <Plus size={18} />
                            ایجاد درخواست
                        </button>
                    )}
                </div>
            </div>

            {/* Info Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                    <FileText className="w-5 h-5 text-green-500 mt-0.5 ml-2" />
                    <div>
                        <h3 className="text-sm font-medium text-green-900">اطلاعات</h3>
                        <p className="text-sm text-green-700 mt-1">
                            در این بخش می‌توانید درخواست‌های ارسالی و دریافتی خود را مشاهده کنید.
                            شامل درخواست‌های تعمیرات، خدمات و سایر موارد.
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {shouldShowError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start">
                            <FileText className="w-5 h-5 text-red-500 mt-0.5 ml-2" />
                            <div>
                                <h3 className="text-sm font-medium text-red-900">خطا در بارگذاری درخواست‌ها</h3>
                                <p className="text-sm text-red-700 mt-1">
                                    {error === 'Not Found' || error?.includes('Not Found') 
                                        ? 'درخواستی یافت نشد. لطفاً دوباره تلاش کنید.' 
                                        : error}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            تلاش مجدد
                        </button>
                    </div>
                </div>
            )}

            {/* Requests List */}
            {!buildingId ? (
                <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">ساختمان انتخاب نشده</h3>
                    <p className="text-gray-600">لطفاً ابتدا یک ساختمان انتخاب کنید.</p>
                </div>
            ) : shouldShowError ? null : displayed.length === 0 ? (
                <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ درخواستی یافت نشد</h3>
                    <p className="text-gray-600">هنوز هیچ درخواستی برای این ساختمان ثبت نشده است.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {displayed.map((request) => (
                        <RequestItem
                            key={request.request_id || request.id}
                            request={request}
                            onClick={() => setSelectedRequest(request)}
                        />
                    ))}
                </div>
            )}

            {/* Request Detail - No modal available */}

            <CreateRequestModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
                buildingId={buildingId}
            />
        </div>
    );
}
