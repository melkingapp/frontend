import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import SurveyBase from "./SurveyBase";
import { ChevronLeft } from "lucide-react";

export default function SurveySummary() {
    const limit = 4;
    const { surveys } = useSelector(state => state.surveys);

    return (
        <div className="p-6 bg-white rounded-xl shadow border border-gray-100">
            <SurveyBase limit={limit} />

            {surveys.length > limit && (
                <div className="mt-4 border-t pt-4 flex justify-end">
                    <Link
                        to="/manager/notifications/survey"
                        className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 hover:underline font-medium transition"
                    >
                        <ChevronLeft size={16} />
                        مشاهده همه نظرسنجی‌ها
                    </Link>
                </div>
            )}

        </div>
    )
}
