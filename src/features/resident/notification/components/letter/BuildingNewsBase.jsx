import { useState, useEffect } from "react";
import { Mail, Loader2, RefreshCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import LetterItem from "../../../../manager/notification/components/letter/LetterItem";
import LetterModal from "../../../../manager/notification/components/letter/LetterModal";
import { fetchBuildingLetters } from "../../../../manager/notification/slices/lettersSlice";
import { selectSelectedResidentBuilding, setSelectedBuilding as setResidentSelectedBuilding } from "../../../building/residentBuildingSlice";
import { selectMembershipRequests, fetchMembershipRequests } from "../../../../membership/membershipSlice";

export default function BuildingNewsBase({ letters: propLetters, limit }) {
    const dispatch = useDispatch();
    const selectedBuilding = useSelector(selectSelectedResidentBuilding);
    const membershipRequests = useSelector(selectMembershipRequests);
    const { letters: reduxLetters, loading, error } = useSelector(state => state.letters);
    const [selectedLetter, setSelectedLetter] = useState(null);

    // Use Redux data if available, otherwise fall back to props
    const dataSource = reduxLetters.length > 0 ? reduxLetters : (propLetters || []);
    
    // Sort by created_at (from API) or createdAt (from props)
    const sorted = [...dataSource].sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt);
        const dateB = new Date(b.created_at || b.createdAt);
        return dateB - dateA;
    });
    
    const displayed = limit ? sorted.slice(0, limit) : sorted;

    // Ensure membership requests are loaded
    useEffect(() => {
        if (!membershipRequests || membershipRequests.length === 0) {
            dispatch(fetchMembershipRequests());
        }
    }, [dispatch]);

    // Auto-select resident building if none selected
    useEffect(() => {
        if (!selectedBuilding && membershipRequests && membershipRequests.length > 0) {
            const approved = membershipRequests.find(r => (
                r.status === 'approved' || r.status === 'owner_approved' || r.status === 'manager_approved'
            ));
            if (approved) {
                dispatch(setResidentSelectedBuilding({ building_id: approved.building, title: approved.building_title }));
            }
        }
    }, [dispatch, selectedBuilding, membershipRequests]);

    // Normalize building id from selectedBuilding (may be composite "{id}-{unit}")
    const resolveBuildingId = () => {
        const raw = selectedBuilding?.building_id ?? selectedBuilding?.id;
        if (!raw) return undefined;
        if (typeof raw === 'string') {
            // Extract first numeric token like "123" from strings such as "undefined-2" or "123-5"
            const match = raw.match(/\d+/);
            if (match && match[0]) {
                const asNum = Number(match[0]);
                return Number.isFinite(asNum) ? asNum : match[0];
            }
            return raw;
        }
        return raw;
    };

    // Fetch letters when building is available
    useEffect(() => {
        const bId = resolveBuildingId();
        if (bId !== undefined && bId !== null && bId !== '') {
            dispatch(fetchBuildingLetters(bId));
        }
    }, [dispatch, selectedBuilding]);

    const handleRefresh = () => {
        const bId = resolveBuildingId();
        if (bId !== undefined && bId !== null && bId !== '') {
            dispatch(fetchBuildingLetters(bId));
        }
    };

    if (loading && displayed.length === 0) {
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
                <h2 className="text-xl font-semibold text-gray-900">اخبار ساختمانی</h2>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 
                             hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    بروزرسانی
                </button>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <Mail className="w-5 h-5 text-blue-500 mt-0.5 ml-2" />
                    <div>
                        <h3 className="text-sm font-medium text-blue-900">اطلاعات</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            در این بخش می‌توانید اخبار و اطلاعیه‌های ساختمان را مشاهده کنید.
                            امکان ایجاد خبر جدید فقط برای مدیر ساختمان در دسترس است.
                        </p>
                    </div>
                </div>
            </div>

            {/* Letters List */}
            {displayed.length === 0 ? (
                <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ خبری یافت نشد</h3>
                    <p className="text-gray-600">هنوز هیچ خبر یا اطلاعیه‌ای برای این ساختمان ثبت نشده است.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {displayed.map((letter) => (
                        <LetterItem
                            key={letter.letter_id || letter.id}
                            letter={letter}
                            onClick={() => setSelectedLetter(letter)}
                        />
                    ))}
                </div>
            )}

            {/* Letter Detail Modal */}
            {selectedLetter && (
                <LetterModal
                    letter={selectedLetter}
                    onClose={() => setSelectedLetter(null)}
                />
            )}
        </div>
    );
}
