import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import clsx from "clsx";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    selectResidentRequests,
    selectSelectedResidentBuilding,
    selectApprovedBuildings,
    setSelectedBuilding,
    fetchResidentRequests,
    refreshApprovedBuildings,
    maintainApprovedBuildings,
} from "../../../../features/resident/building/residentBuildingSlice";
import { selectMembershipRequests, fetchMembershipRequests } from "../../../../features/membership/membershipSlice";
import MelkingLogo from "../../../../assets/logo/Melking-fa.svg";

export default function ResidentSidebar({ navItems, sidebarOpen, onCloseSidebar }) {
    const { pathname } = useLocation();
    const [openMenus, setOpenMenus] = useState({});
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const dispatch = useDispatch();

    const selectedBuilding = useSelector(selectSelectedResidentBuilding);
    const requests = useSelector(selectResidentRequests);
    const approvedBuildings = useSelector(selectApprovedBuildings);
    const membershipRequests = useSelector(selectMembershipRequests);
    // const { user } = useSelector(state => state.auth);

    // تعیین نقش واقعی کاربر بر اساس درخواست‌های عضویت
    const getUserRole = () => {
        const approvedRequests = membershipRequests.filter(req => 
            req.status === 'approved' || 
            req.status === 'owner_approved' || 
            req.status === 'manager_approved'
        );
        
        const hasOwnerRole = approvedRequests.some(req => req.role === 'owner');
        const hasResidentRole = approvedRequests.some(req => req.role === 'resident');
        
        if (hasOwnerRole && hasResidentRole) {
            return 'owner'; // اگر هم مالک و هم ساکن است، مالک را اولویت بده
        } else if (hasOwnerRole) {
            return 'owner';
        } else if (hasResidentRole) {
            return 'resident';
        }
        
        return 'resident'; // پیش‌فرض
    };

    const userRole = getUserRole();

    // const pendingRequestsCount = requests.filter(req => req.status === 'pending').length;

    useEffect(() => {
        // Only fetch if we don't have requests in Redux store
        if (requests.length === 0) {
            dispatch(fetchResidentRequests());
        }
        
        // Fetch membership requests for unit selection
        if (membershipRequests.length === 0) {
            dispatch(fetchMembershipRequests());
        }
        
        // Fetch approved buildings directly from BuildingUser table
        if (approvedBuildings.length === 0) {
            dispatch(refreshApprovedBuildings()).catch(() => {
                console.log('🔄 API failed, using maintain action...');
                dispatch(maintainApprovedBuildings());
            });
        }
    }, [dispatch, requests.length, approvedBuildings.length]);

    // Get approved units from membership requests
    // اگر کاربر هم مالک و هم ساکن است، فقط نقش مالک را نشان بده
    const approvedUnits = (() => {
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
    })();

    // Auto-select first approved unit if none is selected
    useEffect(() => {
        if (approvedUnits.length > 0 && !selectedBuilding) {
            const firstUnit = {
                id: `${approvedUnits[0].building}-${approvedUnits[0].unit_number}`,
                building_id: approvedUnits[0].building,
                title: approvedUnits[0].building_title,
                building_code: approvedUnits[0].building_code,
                unit_info: {
                    unit_number: approvedUnits[0].unit_number,
                    floor: approvedUnits[0].floor,
                    area: approvedUnits[0].area,
                    resident_count: approvedUnits[0].resident_count,
                    has_parking: approvedUnits[0].has_parking,
                    parking_count: approvedUnits[0].parking_count,
                    role: approvedUnits[0].role
                }
            };
            dispatch(setSelectedBuilding(firstUnit));
        }
    }, [approvedUnits, selectedBuilding, dispatch]);

    // Auto-refresh membership requests every 30 seconds for pending requests
    useEffect(() => {
        const hasPendingRequests = membershipRequests.some(req => req.status === 'pending');
        if (!hasPendingRequests) return;

        const interval = setInterval(() => {
            dispatch(fetchMembershipRequests());
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [membershipRequests, dispatch]);

    const toggleMenu = (label) => {
        setOpenMenus((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    const handleSelectBuilding = (building) => {
        dispatch(setSelectedBuilding(building));
        setDropdownOpen(false);
    };

    const renderMenuItems = (isMobile = false) => {
        // Show menu items even when no building is selected, but with disabled state
        if (!selectedBuilding || approvedUnits.length === 0) {
            return (
                <div className="space-y-1 w-full">
                    <div className="text-center text-yellow-200/70 text-sm py-4">
                        {approvedUnits.length === 0 
                            ? "هنوز عضویت شما در هیچ ساختمانی تایید نشده است"
                            : "لطفاً ابتدا یک واحد انتخاب کنید"
                        }
                    </div>
                </div>
            );
        }

        return navItems.map((item, index) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus[item.label];
            const isActive = pathname === item.to;
            
            // نمایش "درخواست‌های عضویت ساکنان" فقط برای مالک‌ها
            if (item.label === "درخواست‌های عضویت ساکنان" && userRole !== 'owner') {
                return null;
            }

            return (
                <div key={index} className="w-full">
                    <div
                        className={clsx(
                            "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 select-none",
                            isActive
                                ? isMobile
                                    ? "bg-yellow-400 text-yellow-900 font-semibold shadow-inner"
                                    : "bg-yellow-400 text-yellow-900 font-semibold shadow-inner"
                                : isMobile
                                ? "hover:bg-gray-100 text-gray-700"
                                : "hover:bg-white/20 text-white/90"
                        )}
                        onClick={() => {
                            if (hasChildren) {
                                toggleMenu(item.label);
                            }
                        }}
                    >
                        <Link
                            to={item.to}
                            className="flex items-center gap-3 flex-1"
                            onClick={(e) => {
                                if (hasChildren) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <span className="flex-shrink-0">{item.icon}</span>
                            {!isCollapsed && (
                                <span className="text-sm font-medium truncate">
                                    {item.label}
                                </span>
                            )}
                        </Link>

                        {hasChildren && !isCollapsed && (
                            <span className="flex-shrink-0">
                                {isOpen ? (
                                    <ChevronUp size={16} />
                                ) : (
                                    <ChevronDown size={16} />
                                )}
                            </span>
                        )}
                    </div>

                    {hasChildren && isOpen && !isCollapsed && (
                        <div
                            className={clsx(
                                "pl-8 pr-2 mt-1 space-y-1 rounded-r-md border-r-4 border-yellow-400"
                            )}
                        >
                            {item.children.map((child, index) => (
                                <Link
                                    key={index}
                                    to={child.to}
                                    className={clsx(
                                        "block text-sm px-3 py-1.5 rounded-lg transition-colors duration-200 select-none",
                                        pathname === child.to
                                            ? isMobile
                                                ? "text-yellow-400 font-semibold shadow-inner"
                                                : "text-yellow-400 font-semibold shadow-inner"
                                            : isMobile
                                            ? "hover:bg-gray-100 text-gray-700"
                                            : "hover:bg-white/20 text-white/90"
                                    )}
                                >
                                    {child.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        });
    };

    const renderBuildingSelector = (isMobile = false) => (
        <div className="relative z-50">
            <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className={clsx(
                    "text-sm font-semibold px-3 py-2 rounded-xl flex items-center justify-between w-full transition",
                    isMobile
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-yellow-100 text-yellow-900"
                )}
            >
                <span className="truncate max-w-[150px]">
                    {selectedBuilding?.title ? `${selectedBuilding.title} - واحد ${selectedBuilding.unit_info?.unit_number || 'نامشخص'}` : "انتخاب واحد"}
                    {selectedBuilding?.building_code && (
                        <span className="block text-xs text-yellow-700 mt-1">
                            کد: {selectedBuilding.building_code}
                        </span>
                    )}
                    {membershipRequests.some(req => req.status === 'pending') && (
                        <span className="block text-xs text-orange-600 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {membershipRequests.filter(req => req.status === 'pending').length} در انتظار تایید
                        </span>
                    )}
                </span>
                <div className="flex items-center gap-1">
                    <ChevronDown className="ml-1" size={16} />
                </div>
            </button>

            {dropdownOpen && (
                <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg border text-sm max-h-60 overflow-y-auto z-50">
                    {approvedUnits.length > 0 ? (
                        <>
                            {approvedUnits.map((request) => {
                                const unit = {
                                    id: `${request.building}-${request.unit_number}-${request.role}-${request.request_id}`,
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
                                };
                                
                                return (
                                    <button
                                        key={unit.id}
                                        onClick={() => handleSelectBuilding(unit)}
                                        className={clsx(
                                            "w-full text-right px-4 py-2 hover:bg-yellow-50 text-gray-800 transition-colors",
                                            selectedBuilding?.id === unit.id ||
                                            (selectedBuilding?.building_id === unit.building_id && 
                                             selectedBuilding?.unit_info?.unit_number === unit.unit_info?.unit_number)
                                                ? "bg-yellow-100 border-r-4 border-yellow-400"
                                                : ""
                                        )}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {unit.title} - واحد {unit.unit_info?.unit_number || 'نامشخص'}
                                            </span>
                                            {unit.building_code && (
                                                <span className="text-xs text-gray-500 mt-1">
                                                    کد: {unit.building_code}
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-500">
                                                طبقه {unit.unit_info?.floor || 'نامشخص'} • {userRole === 'owner' ? 'مالک' : 'ساکن'}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                            
                            {/* Show pending requests section */}
                            {membershipRequests.some(req => req.status === 'pending') && (
                                <>
                                    <div className="border-t border-gray-200 my-2"></div>
                                    <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 font-medium">
                                        درخواست‌های در انتظار:
                                    </div>
                                    {membershipRequests
                                        .filter(req => req.status === 'pending')
                                        .map((request, index) => (
                                            <div
                                                key={request.request_id || index}
                                                className="w-full text-right px-4 py-2 text-gray-600 bg-orange-50 border-r-4 border-orange-300"
                                            >
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3 h-3 text-orange-500" />
                                                        <span className="font-medium">
                                                            {request.building_title} - واحد {request.unit_number || 'نامشخص'}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500 mt-1">
                                                        کد: {request.building_code}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                </>
                            )}
                        </>
                    ) : (
                        <div className="px-4 py-2 text-gray-400 text-center">
                            واحدی یافت نشد
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={clsx(
                    "hidden md:flex flex-col shadow-lg space-y-3 overflow-y-auto rounded-l-3xl transition-all duration-300 relative",
                    isCollapsed
                        ? "w-20 items-center bg-gradient-to-b from-[#1C2E4E] to-[#12355B] p-3"
                        : "w-64 bg-gradient-to-b from-[#1C2E4E] to-[#12355B] p-5"
                )}
            >
                <button
                    onClick={() => setIsCollapsed((prev) => !prev)}
                    className="mb-4 self-end text-yellow-300 hover:text-yellow-400 transition-transform duration-300"
                    aria-label={isCollapsed ? "باز کردن سایدبار" : "کوچک کردن سایدبار"}
                >
                    {isCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
                </button>

                {!isCollapsed && renderBuildingSelector(false)}

                {renderMenuItems()}

                {!isCollapsed && (
                    <div className="sticky bottom-0 w-full text-center text-xs text-yellow-200 pt-6 border-t border-yellow-300/30 select-none bg-gradient-to-t from-[#12355B] to-transparent">
                        {/* Logo */}
                        <div className="flex justify-center mb-3">
                            <img 
                                src={MelkingLogo} 
                                alt="Melking Logo" 
                                className="h-32 w-auto filter brightness-0 invert"
                            />
                        </div>
                        <strong className="text-[14px] tracking-wider">نسخه 1.0.0</strong>
                    </div>
                )}
            </aside>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-sm"
                    onClick={onCloseSidebar}
                >
                    <aside
                        className="absolute right-0 top-0 w-64 h-full bg-white shadow-lg p-4 space-y-3 overflow-y-auto rounded-l-3xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="mb-4 text-melkingDarkBlue text-sm hover:text-gray-900 transition"
                            onClick={onCloseSidebar}
                            aria-label="بستن منوی موبایل"
                        >
                            ✕ بستن
                        </button>

                        {renderBuildingSelector(true)}

                        {renderMenuItems(true)}
                    </aside>
                </div>
            )}
        </>
    );
}
