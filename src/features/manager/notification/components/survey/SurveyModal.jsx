import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { submitSurveyResponse } from "../../slices/surveysSlice";
import { selectSelectedBuilding } from "../../../building/buildingSlice";
import { selectSelectedResidentBuilding } from "../../../../resident/building/residentBuildingSlice";

export default function SurveyModal({ survey, onClose, currentUser = "کاربر" }) {
    const dispatch = useDispatch();
    const managerSelectedBuilding = useSelector(selectSelectedBuilding);
    const residentSelectedBuilding = useSelector(selectSelectedResidentBuilding);
    const selectedBuilding = managerSelectedBuilding || residentSelectedBuilding;
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [optionsData, setOptionsData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate actual status based on dates
    const calculateStatus = () => {
        if (!survey) return "finished";
        const endDate = survey.end_date || survey.endDate;
        if (!endDate) return survey.status || "finished";
        
        const now = new Date();
        const endDateTime = new Date(endDate);
        return now < endDateTime ? "active" : "finished";
    };

    const actualStatus = calculateStatus();

    useEffect(() => {
        if (!survey) return;
        
        console.log("🔥 SurveyModal useEffect - survey:", survey);
        console.log("🔥 SurveyModal useEffect - survey.options:", survey.options);
        console.log("🔥 SurveyModal useEffect - survey.questions:", survey.questions);
        console.log("🔥 SurveyModal useEffect - survey keys:", Object.keys(survey));
        
        // Handle both API data and fake data
        // Try to get options from survey.options first (transformed data from SurveyItem)
        // If not available, get from survey.questions[0].options (direct API response)
        let options = survey.options || [];
        
        // If options is still empty, try to get from questions
        if (options.length === 0 && survey.questions && survey.questions.length > 0) {
            const firstQuestion = survey.questions[0];
            console.log("🔥 SurveyModal useEffect - firstQuestion:", firstQuestion);
            console.log("🔥 SurveyModal useEffect - firstQuestion.options:", firstQuestion.options);
            
            // Transform API options to match expected format
            if (firstQuestion.options && firstQuestion.options.length > 0) {
                options = firstQuestion.options.map(opt => ({
                    id: opt.id || opt.option_id,
                    text: opt.option_text || opt.text,
                    votes: opt.votes || 0,
                    voters: opt.voters || []
                }));
                console.log("🔥 SurveyModal useEffect - transformed options from questions:", options);
            }
        }
        
        console.log("🔥 SurveyModal useEffect - final options array:", options);
        console.log("🔥 SurveyModal useEffect - final options length:", options.length);
        
        const votedIds = options
            .filter((opt) => opt.voters?.includes(currentUser))
            .map((opt) => opt.id);
        setSelectedOptions(votedIds);
        setOptionsData(options.map(opt => ({ ...opt })));
        
        console.log("🔥 SurveyModal useEffect - optionsData set to:", options.map(opt => ({ ...opt })));
    }, [survey, currentUser]);

    if (!survey) return null;

    const totalVotes = optionsData.reduce((sum, opt) => sum + (opt.votes || 0), 0);

    const toggleOption = (id) => {
        const multipleChoice = survey.multipleChoice; // Use the actual value
        if (multipleChoice) {
            setSelectedOptions((prev) =>
                prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
            );
        } else {
            setSelectedOptions([id]);
        }
    };

    const handleVote = async () => {
        if (!selectedBuilding) {
            toast.error("ساختمان انتخاب نشده است");
            return;
        }

        if (selectedOptions.length === 0) {
            toast.error("لطفاً حداقل یک گزینه انتخاب کنید");
            return;
        }

        setIsSubmitting(true);

        try {
            // Get question ID from survey data
            let questionId = survey.questions?.[0]?.id || 
                            survey.questions?.[0]?.question_id ||
                            survey.questionId || 
                            optionsData[0]?.question_id;

            // For fake data, use a default question ID
            if (!questionId && survey.options && survey.options.length > 0) {
                questionId = 1; // Default question ID for fake data
                console.log("🔥 Using default question ID for fake data:", questionId);
            }

            console.log("🔥 Question ID found:", questionId);
            console.log("🔥 Survey questions structure:", survey.questions);

            if (!questionId) {
                console.error("🔥 Survey data structure:", survey);
                throw new Error("Question ID not found in survey data");
            }

            // Prepare response data for backend
            const responseData = {
                responses: selectedOptions.map(optionId => ({
                    question_id: questionId,
                    selected_option_id: optionId
                }))
            };

            console.log("🔥 Survey data:", survey);
            console.log("🔥 Survey questions:", survey.questions);
            console.log("🔥 First question:", survey.questions?.[0]);
            console.log("🔥 Question ID:", survey.questions?.[0]?.id);
            console.log("🔥 Submitting vote:", responseData);
            console.log("🔥 Selected building:", selectedBuilding);
            console.log("🔥 Building ID:", selectedBuilding.building_id || selectedBuilding.id);
            console.log("🔥 Survey ID:", survey.id || survey.survey_id);

            // Normalize building ID (could be like "undefined-2")
            const rawBuildingId = selectedBuilding.building_id || selectedBuilding.id;
            const normalizedBuildingId = typeof rawBuildingId === 'string' 
                ? (rawBuildingId.match(/\d+/)?.[0] || rawBuildingId)
                : rawBuildingId;

            console.log("🔥 Normalized building ID:", normalizedBuildingId);

            // Submit vote to backend
            await dispatch(submitSurveyResponse({
                buildingId: normalizedBuildingId,
                surveyId: survey.id || survey.survey_id,
                responseData: responseData
            })).unwrap();

            // Update local state for immediate feedback
            const newOptions = optionsData.map((opt) => {
                if (selectedOptions.includes(opt.id)) {
                    const voters = opt.voters ? [...opt.voters] : [];
                    if (!voters.includes(currentUser)) voters.push(currentUser);
                    return { ...opt, votes: (opt.votes || 0) + 1, voters };
                }
                return opt;
            });
            setOptionsData(newOptions);

            toast.success("رأی شما با موفقیت ثبت شد");
            onClose();
        } catch (error) {
            console.error("Error submitting vote:", error);
            toast.error("خطا در ثبت رأی: " + (error.message || error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetractVote = () => {
        const newOptions = optionsData.map((opt) => {
            if (selectedOptions.includes(opt.id)) {
                const voters = opt.voters ? [...opt.voters] : [];
                const idx = voters.indexOf(currentUser);
                if (idx !== -1) voters.splice(idx, 1);
                return { ...opt, votes: Math.max((opt.votes || 0) - 1, 0), voters };
            }
            return opt;
        });
        setOptionsData(newOptions);
        setSelectedOptions([]);
        toast("رأی شما با موفقیت پس گرفته شد");
    };

    return (
        <Dialog open={!!survey} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 sm:p-6" aria-hidden="true">
                <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-lg sm:max-w-md p-6 space-y-4 animate-fadeIn overflow-hidden">

                    {/* هدر */}
                    <div className="flex justify-between items-start sm:items-center border-b pb-2 mb-2">
                        <h2 className="text-xl font-bold text-melkingDarkBlue">{survey.title || survey.question}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-melkingDarkBlue transition mt-1 sm:mt-0"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* پیام چندگزینه‌ای */}
                    {(survey.multipleChoice || false) && (actualStatus === "pending" || actualStatus === "active") && (
                        <p className="text-xs text-gray-400 mb-2">
                            ⚠️ شما می‌توانید بیش از یک گزینه انتخاب کنید
                        </p>
                    )}

                    {/* گزینه‌ها */}
                    <div className="space-y-3">
                        {console.log("🔥 Rendering optionsData:", optionsData)}
                        {optionsData.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                هیچ گزینه‌ای برای این نظرسنجی یافت نشد.
                            </div>
                        ) : (
                            optionsData.map((opt) => {
                                const votes = opt.votes || 0;
                                const percentage = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;
                                return (
                                    <div
                                        key={opt.id}
                                        className="p-4 border rounded-xl hover:shadow-lg transition flex flex-col gap-2 bg-white"
                                    >
                                        {/* متن گزینه */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                            {(actualStatus === "pending" || actualStatus === "active") && (
                                                <input
                                                    type={survey.multipleChoice ? "checkbox" : "radio"}
                                                    checked={selectedOptions.includes(opt.id)}
                                                    onChange={() => toggleOption(opt.id)}
                                                    className="w-5 h-5 accent-melkingDarkBlue flex-shrink-0"
                                                />
                                            )}
                                            <span className="font-medium text-gray-700">{opt.text}</span>
                                        </div>

                                    {/* نوار درصد و تعداد رأی */}
                                    <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-1">
                                        <div
                                            className="h-3 bg-melkingDarkBlue rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>{percentage}%</span>
                                        <span>{votes} رأی</span>
                                    </div>

                                        {/* اسامی رأی‌دهندگان */}
                                        {!(survey.anonymous || false) && opt.voters?.length > 0 && (
                                            <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-1 overflow-x-auto">
                                                {opt.voters.map((voter, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-gray-100 rounded-full whitespace-nowrap">
                                                        {voter}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* دکمه‌ها */}
                    {(actualStatus === "pending" || actualStatus === "active") && (
                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <button
                                onClick={handleVote}
                                disabled={selectedOptions.length === 0 || isSubmitting}
                                className="flex-1 bg-melkingDarkBlue text-white py-2 rounded-xl hover:bg-melkingGold hover:text-melkingDarkBlue transition disabled:opacity-50"
                            >
                                {isSubmitting ? "در حال ثبت..." : "ثبت رأی"}
                            </button>
                            {selectedOptions.length > 0 && (
                                <button
                                    onClick={handleRetractVote}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-xl hover:bg-gray-100 transition flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft size={18} />
                                    پس گرفتن رأی
                                </button>
                            )}
                        </div>
                    )}
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}
