import { useState, useEffect } from "react";
import { Mail, Loader2, RefreshCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import LetterItem from "./LetterItem";
import LetterModal from "./LetterModal";
import CreateLetterModal from "./CreateLetterModal";
import { fetchBuildingLetters, createLetter } from "../../slices/lettersSlice";
import { selectSelectedBuilding } from "../../../building/buildingSlice";

export default function BuildingNewsBase({ letters: propLetters, limit }) {
    const dispatch = useDispatch();
    const selectedBuilding = useSelector(selectSelectedBuilding);
    const { letters: reduxLetters, loading, error } = useSelector(state => state.letters);
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Use Redux data if available, otherwise fall back to props
    const dataSource = reduxLetters.length > 0 ? reduxLetters : (propLetters || []);
    
    // Sort by created_at (from API) or createdAt (from props)
    const sorted = [...dataSource].sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt);
        const dateB = new Date(b.created_at || b.createdAt);
        return dateB - dateA;
    });
    
    const displayed = limit ? sorted.slice(0, limit) : sorted;

    // Fetch letters when component mounts
    useEffect(() => {
        if (selectedBuilding?.building_id || selectedBuilding?.id) {
            console.log("🔥 BuildingNewsBase - Fetching letters for building:", selectedBuilding);
            dispatch(fetchBuildingLetters(selectedBuilding.building_id || selectedBuilding.id))
                .then((result) => {
                    console.log("🔥 BuildingNewsBase - Fetch letters result:", result);
                })
                .catch((error) => {
                    console.error("🔥 BuildingNewsBase - Fetch letters error:", error);
                });
        }
    }, [dispatch, selectedBuilding?.building_id, selectedBuilding?.id]);

    const handleRefresh = () => {
        if (selectedBuilding?.building_id || selectedBuilding?.id) {
            dispatch(fetchBuildingLetters(selectedBuilding.building_id || selectedBuilding.id));
        }
    };

    const handleLetterSelect = (letter) => {
        console.log("🔥 BuildingNewsBase - Selected letter:", letter);
        setSelectedLetter(letter);
    };
    const handleCreateLetter = async (letterData) => {
        if (!selectedBuilding?.building_id && !selectedBuilding?.id) {
            toast.error("ساختمان انتخاب نشده است");
            return;
        }

        try {
            console.log("🔥 Creating letter with data:", letterData);
            
            // Map frontend data to backend format
            const backendData = {
                building_id: selectedBuilding.building_id || selectedBuilding.id,
                subject: letterData.title,
                content: letterData.description,
                role: letterData.target,
                attachment: letterData.attachment
            };

            console.log("🔥 Backend data:", backendData);

            await dispatch(createLetter(backendData)).unwrap();
            toast.success("نامه با موفقیت ایجاد شد!");
            
            // Refresh the letters list
            dispatch(fetchBuildingLetters(selectedBuilding.building_id || selectedBuilding.id));
        } catch (error) {
            console.error("🔥 Error creating letter:", error);
            toast.error(error || "خطا در ایجاد نامه");
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-melkingDarkBlue flex items-center gap-2">
                    <Mail className="text-melkingDarkBlue" size={20} />
                    اخبار ساختمانی
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
                        <Mail size={18} />
                        ایجاد نامه
                    </button>
                </div>
            </div>

            {loading && displayed.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-melkingDarkBlue" size={24} />
                    <span className="mr-2 text-gray-600">در حال بارگذاری...</span>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-red-600 mb-2">خطا در بارگذاری اخبار</p>
                    <p className="text-sm text-gray-500">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="mt-2 px-4 py-2 bg-melkingDarkBlue text-white rounded-lg hover:bg-melkingGold hover:text-melkingDarkBlue transition"
                    >
                        تلاش مجدد
                    </button>
                </div>
            ) : displayed.length === 0 ? (
                <p className="text-gray-400 text-sm">هیچ نامه‌ای موجود نیست.</p>
            ) : (
                <div className="space-y-4">
                    {displayed.map((letter, idx) => (
                        <LetterItem
                            key={letter.letter_id || letter.id}
                            letter={letter}
                            index={idx}
                            onSelect={handleLetterSelect}
                        />
                    ))}
                </div>
            )}

            <LetterModal letter={selectedLetter} onClose={() => setSelectedLetter(null)} />
            <CreateLetterModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={handleCreateLetter}
            />
        </div>
    );
}