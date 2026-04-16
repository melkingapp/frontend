import { Vote, Calendar, Clock, Trash2 } from "lucide-react";
const clsx = (...classes) => classes.filter(Boolean).join(" ");
import { useState } from "react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { fetchSurveyDetails, deleteSurvey, fetchBuildingSurveys } from "../../slices/surveysSlice";
import { selectSelectedBuilding } from "../../../building/buildingSlice";
import { selectSelectedResidentBuilding } from "../../../../resident/building/residentBuildingSlice";

export default function SurveyItem({ survey, onSelect, selectedBuilding: propSelectedBuilding }) {
    const dispatch = useDispatch();
    const managerSelectedBuilding = useSelector(selectSelectedBuilding);
    const residentSelectedBuilding = useSelector(selectSelectedResidentBuilding);
    const selectedBuilding = propSelectedBuilding || managerSelectedBuilding || residentSelectedBuilding;
    
    // Handle both API data and fake data
    const question = survey.title || survey.question;
    const createdAt = survey.created_at || survey.createdAt;
    const endDate = survey.end_date || survey.endDate;
    const options = survey.options || [];
    
    // Calculate status based on current date vs end date
    const now = new Date();
    const endDateTime = new Date(endDate);
    const isActive = now < endDateTime;
    const status = isActive ? "active" : "finished";
    
    const createdDateStr = new Date(createdAt).toLocaleDateString("fa-IR");
    const endDateStr = new Date(endDate).toLocaleDateString("fa-IR");

    const borderColor = status === "pending" || status === "active" ? "border-green-300" : "border-red-300";
    const rightBorderColor = status === "pending" || status === "active" ? "border-r-4 border-green-500" : "border-r-4 border-red-500";

    const maxVotesOption = options && options.length > 0
        ? options.reduce((prev, curr) => (curr.votes > prev.votes ? curr : prev))
        : null;

    const [showConfirm, setShowConfirm] = useState(false);

    const handleSurveyClick = async () => {
        if (!selectedBuilding) {
            toast.error("ساختمان انتخاب نشده است");
            return;
        }

        try {
            // If survey already has options (fake data), use it directly
            if (survey.options && survey.options.length > 0) {
                onSelect && onSelect(survey);
                return;
            }

            // Normalize building id (could be like "undefined-2")
            const rawId = (selectedBuilding.building_id ?? selectedBuilding.id);
            const match = typeof rawId === 'string' ? rawId.match(/\d+/) : null;
            const normalizedBuildingId = match && match[0] ? Number(match[0]) || match[0] : rawId;

            // Otherwise, fetch detailed survey data from API
            const detailedSurvey = await dispatch(fetchSurveyDetails({
                buildingId: normalizedBuildingId,
                surveyId: survey.id || survey.survey_id
            })).unwrap();

            console.log("🔥 Detailed survey response:", detailedSurvey);
            console.log("🔥 Survey questions:", detailedSurvey.survey.questions);
            console.log("🔥 First question options:", detailedSurvey.survey.questions?.[0]?.options);

            // Transform API data to match modal expectations
            const firstQuestion = detailedSurvey.survey.questions?.[0];
            const transformedSurvey = {
                ...detailedSurvey.survey, // Use full survey data from API
                question: detailedSurvey.survey.title,
                title: detailedSurvey.survey.title,
                questions: detailedSurvey.survey.questions, // Keep original questions data
                options: firstQuestion?.options?.map(opt => ({
                    id: opt.id,
                    text: opt.option_text,
                    votes: opt.votes || 0, // Use vote count from API
                    voters: opt.voters || [] // Use voters from API
                })) || [],
                multipleChoice: firstQuestion?.multiple_choice, // Use the actual value from backend
                anonymous: false, // Default to false
                status: status,
                // Keep original survey IDs
                id: survey.id || survey.survey_id,
                survey_id: survey.survey_id || survey.id,
                // Keep user_voted_option_ids from API for accurate vote detection
                user_voted_option_ids: detailedSurvey.survey.user_voted_option_ids || [],
            };

            console.log("🔥 Transformed survey:", transformedSurvey);
            console.log("🔥 Transformed survey.options:", transformedSurvey.options);
            console.log("🔥 Transformed survey.questions:", transformedSurvey.questions);

            onSelect && onSelect(transformedSurvey);
        } catch (error) {
            console.error("Error fetching survey details:", error);
            toast.error("خطا در بارگذاری جزئیات نظرسنجی");
        }
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        setShowConfirm(false);
        try {
            // Get building ID from selected building or survey
            const buildingId = selectedBuilding?.building_id || survey.building_id || survey.building?.building_id;
            const surveyId = survey.id || survey.survey_id;
            
            console.log("🔥 Debug - buildingId:", buildingId, "surveyId:", surveyId);
            console.log("🔥 Debug - selectedBuilding:", selectedBuilding);
            console.log("🔥 Debug - survey:", survey);
            
            if (!buildingId || !surveyId) {
                toast.error('اطلاعات نظرسنجی ناقص است');
                return;
            }
            
            // Call delete survey action
            await dispatch(deleteSurvey({
                buildingId: buildingId,
                surveyId: surveyId
            })).unwrap();
            
            toast.success('نظرسنجی با موفقیت حذف شد!');
            
            // Refresh the surveys list
            dispatch(fetchBuildingSurveys(buildingId));
        } catch (error) {
            console.error('Error deleting survey:', error);
            toast.error('خطا در حذف نظرسنجی: ' + (error.message || error));
        }
    };

    const cancelDelete = () => setShowConfirm(false);

    return (
        <>
            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
                        <p className="mb-4">آیا از حذف کردن مطمئن هستید؟</p>
                        <div className="flex justify-around gap-4">
                            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg">بله</button>
                            <button onClick={cancelDelete} className="px-4 py-2 bg-gray-200 rounded-lg">لغو</button>
                        </div>
                    </div>
                </div>
            )}

            <div
                onClick={handleSurveyClick}
                className={clsx(
                    "flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl shadow-sm cursor-pointer transition-all duration-200 bg-white border",
                    borderColor,
                    rightBorderColor,
                    "hover:shadow-md"
                )}
            >
                {/* ستون ۱: اطلاعات سوال */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                    <div className="flex-1">
                        <h2 className="text-base font-semibold text-gray-800 mb-1">{question}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Calendar size={14} /> ایجاد: {createdDateStr}</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> پایان: {endDateStr}</span>
                        </div>
                    </div>

                    {/* ستون ۲: وضعیت */}
                    <div>
                        <span
                            className={clsx(
                                "inline-block px-3 py-1 rounded-full text-xs font-medium",
                                status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            )}
                        >
                            {status === "active" ? "در حال انجام" : "پایان یافته"}
                        </span>
                    </div>

                    {/* ستون ۳: گزینه بیشترین رای */}
                    {maxVotesOption && (
                        <div className="text-sm text-gray-600">
                            بیشترین رای: <span className="font-medium">{maxVotesOption.text}</span>
                        </div>
                    )}
                </div>

                {/* ستون ۴: دکمه حذف */}
                <div>
                    <button
                        type="button"
                        onClick={handleDeleteClick}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                        title="حذف"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </>
    );
}