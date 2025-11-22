import { useState, useEffect } from "react";
import { BarChart2, Plus, Loader2, RefreshCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import SurveyItem from "./SurveyItem";
import CreateSurveyModal from "./CreateSurveyModal";
import SurveyModal from "./SurveyModal";
import { fetchBuildingSurveys, createSurvey } from "../../slices/surveysSlice";
import { selectSelectedBuilding } from "../../../building/buildingSlice";

export default function SurveyBase({ limit }) {
    const dispatch = useDispatch();
    const selectedBuilding = useSelector(selectSelectedBuilding);
    const { surveys: reduxSurveys, loading, error } = useSelector(state => state.surveys);
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Only use Redux data, no fallback to props
    const dataSource = reduxSurveys || [];
    
    // Sort by created_at (from API) or createdAt (from props)
    const sorted = [...dataSource].sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt);
        const dateB = new Date(b.created_at || b.createdAt);
        return dateB - dateA;
    });
    
    const displayedSurveys = limit ? sorted.slice(0, limit) : sorted;

    // Fetch surveys when component mounts
    useEffect(() => {
        if (selectedBuilding?.building_id || selectedBuilding?.id) {
            console.log("🔥 SurveyBase - Fetching surveys for building:", selectedBuilding);
            dispatch(fetchBuildingSurveys(selectedBuilding.building_id || selectedBuilding.id))
                .then((result) => {
                    console.log("🔥 SurveyBase - Fetch surveys result:", result);
                })
                .catch((error) => {
                    console.error("🔥 SurveyBase - Fetch surveys error:", error);
                });
        }
    }, [dispatch, selectedBuilding]);

    const handleRefresh = () => {
        if (selectedBuilding?.building_id || selectedBuilding?.id) {
            dispatch(fetchBuildingSurveys(selectedBuilding.building_id || selectedBuilding.id));
        }
    };

    const handleCreateSurvey = async (surveyData) => {
        if (!selectedBuilding?.building_id && !selectedBuilding?.id) {
            toast.error("ساختمان انتخاب نشده است");
            return;
        }

        try {
            console.log("🔥 Creating survey with data:", surveyData);
            
            // Map frontend data to backend format
            const now = new Date();
            const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            
            const backendData = {
                title: surveyData.question,
                description: surveyData.description || '',
                survey_type: 'general',
                start_date: now.toISOString().slice(0, 19).replace('T', ' '),
                end_date: endDate.toISOString().slice(0, 19).replace('T', ' '),
                questions: [
                    {
                        question_text: surveyData.question,
                        question_type: 'multiple_choice', // Always multiple_choice
                        multiple_choice: surveyData.multiSelect, // True = multiple choice, False = single choice
                        is_required: true,
                        options: surveyData.options?.filter(opt => opt.trim()) || []
                    }
                ]
            };

            console.log("🔥 Backend data:", backendData);

            await dispatch(createSurvey({
                buildingId: selectedBuilding.building_id || selectedBuilding.id,
                surveyData: backendData
            })).unwrap();
            toast.success("نظرسنجی با موفقیت ایجاد شد!");
            
            // Refresh the surveys list
            dispatch(fetchBuildingSurveys(selectedBuilding.building_id || selectedBuilding.id));
        } catch (error) {
            console.error("🔥 Error creating survey:", error);
            toast.error(error || "خطا در ایجاد نظرسنجی");
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow border border-gray-100">
            {/* هدر */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-melkingDarkBlue flex items-center gap-2">
                    <BarChart2 className="text-melkingDarkBlue" size={20} />
                    نظرسنجی‌ها
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        بروزرسانی
                    </button>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="px-4 py-2 bg-melkingDarkBlue text-white rounded-lg hover:bg-melkingGold hover:text-melkingDarkBlue transition flex items-center gap-2"
                    >
                        <Plus size={18} />
                        ایجاد نظرسنجی
                    </button>
                </div>
            </div>

            {/* لیست نظرسنجی‌ها */}
            {loading && displayedSurveys.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-melkingDarkBlue" size={24} />
                    <span className="mr-2 text-gray-600">در حال بارگذاری...</span>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-red-600 mb-2">خطا در بارگذاری نظرسنجی‌ها</p>
                    <p className="text-sm text-gray-500">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="mt-2 px-4 py-2 bg-melkingDarkBlue text-white rounded-lg hover:bg-melkingGold hover:text-melkingDarkBlue transition"
                    >
                        تلاش مجدد
                    </button>
                </div>
            ) : displayedSurveys.length === 0 ? (
                <p className="text-gray-400 text-sm">هیچ نظرسنجی‌ای موجود نیست.</p>
            ) : (
                <div className="space-y-4">
                    {displayedSurveys.map((survey, idx) => (
                        <SurveyItem
                            key={survey.id || survey.survey_id || idx}
                            index={idx}
                            survey={survey}
                            onSelect={setSelectedSurvey}
                            selectedBuilding={selectedBuilding}
                        />
                    ))}
                </div>
            )}

            <SurveyModal
                survey={selectedSurvey}
                onClose={() => setSelectedSurvey(null)}
            />

            <CreateSurveyModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={handleCreateSurvey}
            />
        </div>
    );
}