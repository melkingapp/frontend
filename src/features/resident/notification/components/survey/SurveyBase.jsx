import { useState, useEffect } from "react";
import { BarChart3, Loader2, RefreshCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import SurveyItem from "../../../../manager/notification/components/survey/SurveyItem";
import SurveyModal from "../../../../manager/notification/components/survey/SurveyModal";
import { fetchBuildingSurveys } from "../../../../manager/notification/slices/surveysSlice";
import { selectSelectedResidentBuilding } from "../../../building/residentBuildingSlice";

export default function SurveyBase({ surveys: propSurveys, limit }) {
    const dispatch = useDispatch();
    const selectedBuilding = useSelector(selectSelectedResidentBuilding);
    const { surveys: reduxSurveys, loading, error } = useSelector(state => state.surveys);
    const user = useSelector(state => state.auth.user);
    const [selectedSurvey, setSelectedSurvey] = useState(null);

    // Use Redux data if available, otherwise fall back to props
    const dataSource = reduxSurveys.length > 0 ? reduxSurveys : (propSurveys || []);
    
    // Sort by created_at (from API) or createdAt (from props)
    const sorted = [...dataSource].sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt);
        const dateB = new Date(b.created_at || b.createdAt);
        return dateB - dateA;
    });
    
    const displayed = limit ? sorted.slice(0, limit) : sorted;

    const resolveBuildingId = () => {
        const raw = selectedBuilding?.building_id ?? selectedBuilding?.id;
        if (!raw) return undefined;
        if (typeof raw === 'string') {
            const match = raw.match(/\d+/);
            if (match && match[0]) {
                const asNum = Number(match[0]);
                return Number.isFinite(asNum) ? asNum : match[0];
            }
            return raw;
        }
        return raw;
    };

    // Fetch surveys when component mounts
    useEffect(() => {
        const bId = resolveBuildingId();
        if (bId !== undefined && bId !== null && bId !== '') {
            dispatch(fetchBuildingSurveys(bId));
        }
    }, [dispatch, selectedBuilding]);

    const handleRefresh = () => {
        const bId = resolveBuildingId();
        if (bId !== undefined && bId !== null && bId !== '') {
            dispatch(fetchBuildingSurveys(bId));
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
                <h2 className="text-xl font-semibold text-gray-900">نظر سنجی</h2>
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
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start">
                    <BarChart3 className="w-5 h-5 text-purple-500 mt-0.5 ml-2" />
                    <div>
                        <h3 className="text-sm font-medium text-purple-900">اطلاعات</h3>
                        <p className="text-sm text-purple-700 mt-1">
                            در این بخش می‌توانید در نظرسنجی‌های ساختمان شرکت کنید.
                            امکان ایجاد نظرسنجی جدید فقط برای مدیر ساختمان در دسترس است.
                        </p>
                    </div>
                </div>
            </div>

            {/* Surveys List */}
            {displayed.length === 0 ? (
                <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ نظرسنجی یافت نشد</h3>
                    <p className="text-gray-600">هنوز هیچ نظرسنجی برای این ساختمان ثبت نشده است.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {displayed.map((survey) => (
                        <SurveyItem
                            key={survey.survey_id || survey.id}
                            survey={survey}
                            onSelect={(transformedSurvey) => setSelectedSurvey(transformedSurvey)}
                        />
                    ))}
                </div>
            )}

            {/* Survey Detail Modal */}
            {selectedSurvey && (
                <SurveyModal
                    survey={selectedSurvey}
                    onClose={() => setSelectedSurvey(null)}
                    currentUser={user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'کاربر'}
                />
            )}
        </div>
    );
}
