import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useSelector } from "react-redux";
import BuildingNewsBase from "./BuildingNewsBase";

export default function BuildingNewsSummary() {
    const { letters } = useSelector(state => state.letters);

    return (
        <div className="p-6 bg-white rounded-xl shadow border border-gray-100">
            <BuildingNewsBase limit={4} />

            {letters.length > 4 && (
                <div className="mt-4 border-t pt-4 flex justify-end">
                    <Link
                        to="/manager/notifications/news"
                        className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 hover:underline font-medium transition"
                    >
                        <ChevronLeft size={16} />
                        مشاهده همه اخبار
                    </Link>
                </div>
            )}
        </div>
    );
}
