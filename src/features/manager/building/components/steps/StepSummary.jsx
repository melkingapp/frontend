import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Button from "../../../../../shared/components/shared/feedback/Button";
import Modal from "../../../../../shared/components/shared/feedback/Modal";
import { formatNumber } from "../../../../../shared/utils/helper";
import InfoCards from "../../../../../shared/components/shared/display/InfoCard";
import { createBuilding } from "../../buildingSlice";

export default function StepSummary({ formData, prev }) {
    const navigate = useNavigate();
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    const handleSubmit = async () => {
        console.log("فرم ارسال شد:", formData);
        setIsLoading(true);
        
        try {
            // Clean form data for API
            const cleanData = {
                title: formData.title,
                usage_type: formData.usage_type,
                property_type: formData.property_type,
                unit_count: parseInt(formData.unit_count) || 0,
                is_owner_resident: formData.is_owner_resident,
                resident_floor: formData.resident_floor || '',
                fund_balance: parseFloat(formData.fund_balance) || 0,
                fund_sheba_number: formData.fund_sheba_number,
                blocks_count: formData.blocks_count || '',
                residential_type: formData.residential_type || 'apartment'
            };
            
            console.log("🔥 Sending clean data:", cleanData);
            
            const result = await dispatch(createBuilding(cleanData)).unwrap();
            console.log("✅ Building created successfully:", result);
            
            setIsSuccessOpen(true);
            navigate('/manager');
        } catch (error) {
            console.error("❌ Building creation failed:", error);
            toast.error("خطا در ثبت ساختمان: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const labelsMap = {
        usage_type: {
            residential: "مسکونی",
            commercial: "تجاری",
            office: "اداری",
            other: "سایر",
        },
        property_type: {
            block: "بلوک",
            tower: "برج",
            complex: "مجتمع",
            community: "مجموعه",
            building: "ساختمان",
        },
        residential_type: {
            apartment: "آپارتمان",
            villa: "ویلا",
            mixed: "ترکیبی",
        },
    };

    const entries = [
        { label: "عنوان ساختمان", value: formData.title },
        { label: "نام مدیر", value: formData.name || "-" },
        { label: "نوع کاربری", value: labelsMap.usage_type[formData.usage_type] || formData.usage_type },
        { label: "نوع ملک", value: labelsMap.property_type[formData.property_type] || formData.property_type },
        { label: "تعداد واحد", value: formData.unit_count },
        { label: "مدیر ساکن است؟", value: formData.is_owner_resident ? "بله" : "خیر" },
        { label: "طبقه محل سکونت مدیر", value: formData.resident_floor },
        { label: "موجودی اولیه صندوق", value: formatNumber(formData.fund_balance) },
        { label: "شماره شبا صندوق", value: formData.fund_sheba_number },
        ...(["complex", "community"].includes(formData.property_type)
            ? [{ label: "تعداد بلوک‌ها", value: formData.blocks_count }]
            : []),
        // Only show residential_type if usage_type is residential
        ...(formData.usage_type === 'residential'
            ? [{ label: "نوع سکونت مسکونی", value: labelsMap.residential_type[formData.residential_type] || formData.residential_type }]
            : []),
    ];

    return (
        <>
            <div className="space-y-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-gray-800">مرحله ۴: مرور نهایی</h2>
                    <p className="text-sm text-gray-500">لطفاً اطلاعات وارد شده را بررسی کنید.</p>
                </div>

                <InfoCards
                    items={entries}
                    containerClass="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    cardClass="bg-gray-50 border border-gray-200 text-center sm:text-right"
                    labelClass="text-gray-500 text-sm"
                    valueClass="text-gray-800 font-medium text-base mt-1"
                />

                <div className="flex justify-between pt-4 border-t border-gray-100">
                    <Button onClick={prev} color="whiteBlue" size="medium" className="w-1/2">
                        مرحله قبل
                    </Button>

                    <Button 
                        onClick={handleSubmit} 
                        color="darkBlue" 
                        size="medium" 
                        className="w-1/2"
                        disabled={isLoading}
                    >
                        {isLoading ? "در حال ثبت..." : "ثبت ساختمان"}
                    </Button>
                </div>
            </div>

            <Modal
                isOpen={isSuccessOpen}
                onClose={() => setIsSuccessOpen(false)}
                icon={<CheckCircle size={48} className="mx-auto text-green-500" />}
                title="ساختمان ثبت شد!"
                description={`ساختمان «${formData.title}» با موفقیت ثبت شد. می‌توانید از داشبورد مدیریت ادامه دهید.`}
                actionText="تایید"
                onAction={() => console.log("بازگشت به داشبورد")}
            />
        </>
    );
}