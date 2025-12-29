import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Button from "../../../../../shared/components/shared/feedback/Button";
import Modal from "../../../../../shared/components/shared/feedback/Modal";
import { formatNumber } from "../../../../../shared/utils/helper";
import InfoCards from "../../../../../shared/components/shared/display/InfoCard";
import { createBuilding, fetchBuildings } from "../../buildingSlice";
import { createUnit } from "../../../unitManagement/slices/unitsSlice";

export default function StepSummary({ formData, prev }) {
    const navigate = useNavigate();
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    const handleSubmit = async () => {
        console.log("فرم ارسال شد:", formData);
        setIsLoading(true);
        
        try {
            // Validation فیلدهای اجباری
            if (!formData.title || !formData.title.trim()) {
                toast.error("عنوان ساختمان الزامی است");
                setIsLoading(false);
                return;
            }
            
            if (!formData.unit_count || parseInt(formData.unit_count) <= 0) {
                toast.error("تعداد واحدها الزامی است و باید عدد مثبت باشد");
                setIsLoading(false);
                return;
            }
            
            if (!formData.fund_balance || parseFloat(formData.fund_balance) < 0) {
                toast.error("موجودی اولیه صندوق الزامی است");
                setIsLoading(false);
                return;
            }
            
            if (!formData.fund_sheba_number || !formData.fund_sheba_number.trim()) {
                toast.error("شماره شبا صندوق الزامی است");
                setIsLoading(false);
                return;
            }
            
            // Clean form data for API
            // Ensure is_owner_resident is a boolean
            const is_owner_resident = Boolean(formData.is_owner_resident);
            
            // Handle blocks_count: required for complex/community, must be integer
            let blocks_count = null;
            if (formData.property_type === 'complex' || formData.property_type === 'community') {
                // برای complex/community، blocks_count اجباری است و باید عدد باشد
                const blocksCountValue = parseInt(formData.blocks_count);
                if (isNaN(blocksCountValue) || blocksCountValue <= 0) {
                    toast.error("تعداد بلوک‌ها برای مجتمع/شهرک الزامی است و باید عدد مثبت باشد");
                    setIsLoading(false);
                    return;
                }
                blocks_count = blocksCountValue;
            }
            
            // Handle resident_floor: required when is_owner_resident is true, must be integer or null
            let resident_floor = null;
            if (is_owner_resident) {
                const floorValue = parseInt(formData.manager_floor || formData.resident_floor || '0');
                if (isNaN(floorValue) || floorValue <= 0) {
                    toast.error("طبقه محل سکونت مدیر الزامی است و باید عدد مثبت باشد");
                    setIsLoading(false);
                    return;
                }
                resident_floor = floorValue;
            }
            
            // Ensure fund_balance is a valid number
            const fund_balance_value = parseFloat(formData.fund_balance);
            if (isNaN(fund_balance_value) || fund_balance_value < 0) {
                toast.error("موجودی اولیه صندوق باید عدد معتبر و غیر منفی باشد");
                setIsLoading(false);
                return;
            }
            
            // Keep as number - backend DecimalField serializer accepts number
            // Django REST framework will convert it to Decimal properly
            const fund_balance = fund_balance_value;
            
            // Ensure unit_count is a valid positive integer
            const unit_count = parseInt(formData.unit_count);
            if (isNaN(unit_count) || unit_count <= 0) {
                toast.error("تعداد واحدها باید عدد مثبت باشد");
                setIsLoading(false);
                return;
            }
            
            const cleanData = {
                title: formData.title.trim(),
                usage_type: formData.usage_type,
                property_type: formData.property_type,
                unit_count: unit_count,
                is_owner_resident: is_owner_resident,
                fund_balance: fund_balance,
                fund_sheba_number: formData.fund_sheba_number.trim(),
            };
            
            // Only include resident_floor if is_owner_resident is true
            if (is_owner_resident) {
                cleanData.resident_floor = resident_floor;
            }
            
            // Only include blocks_count if it's not null (for complex/community)
            if (blocks_count !== null) {
                cleanData.blocks_count = blocks_count;
            }
            
            // لاگ کامل برای دیباگ
            console.log("🔥 Sending clean data:", JSON.stringify(cleanData, null, 2));
            console.log("🔥 Data types:", {
                title: typeof cleanData.title,
                usage_type: typeof cleanData.usage_type,
                property_type: typeof cleanData.property_type,
                unit_count: typeof cleanData.unit_count,
                is_owner_resident: typeof cleanData.is_owner_resident,
                resident_floor: typeof cleanData.resident_floor,
                fund_balance: typeof cleanData.fund_balance,
                fund_sheba_number: typeof cleanData.fund_sheba_number,
                blocks_count: typeof cleanData.blocks_count,
            });
            
            const result = await dispatch(createBuilding(cleanData)).unwrap();
            console.log("✅ Building created successfully:", result);
            
            // اگر مدیر ساکن است، واحد مدیر را ایجاد کن
            const buildingId = result.building_id || result.id;
            if (formData.is_owner_resident && buildingId) {
                try {
                    const managerUnitNumber = formData.manager_unit_number?.trim();
                    if (!managerUnitNumber) {
                        toast.warning("شماره واحد مدیر الزامی است");
                        return;
                    }

                    const unitData = {
                        unit_number: managerUnitNumber,
                        floor: parseInt(formData.manager_floor) || parseInt(formData.resident_floor) || 1,
                        area: formData.manager_area ? parseFloat(formData.manager_area) : null,
                        full_name: formData.name || '',
                        phone_number: '', // شماره تماس مدیر از اطلاعات کاربر گرفته می‌شود
                        role: formData.manager_role || 'owner',
                        owner_type: formData.manager_owner_type || '',
                        tenant_full_name: formData.manager_tenant_full_name || '',
                        tenant_phone_number: formData.manager_tenant_phone_number || '',
                        has_parking: formData.manager_has_parking || false,
                        parking_count: parseInt(formData.manager_parking_count) || 0,
                        resident_count: (formData.manager_role === 'owner' && formData.manager_owner_type === 'empty')
                            ? 0
                            : (parseInt(formData.manager_resident_count) || 1),
                    };

                    console.log("🔥 Creating manager unit:", unitData);
                    await dispatch(createUnit({ buildingId, unitData })).unwrap();
                    console.log("✅ Manager unit created successfully");
                } catch (unitError) {
                    console.error("❌ Manager unit creation failed:", unitError);
                    toast.warning("ساختمان ایجاد شد اما خطا در ایجاد واحد مدیر: " + (unitError.message || 'خطای نامشخص'));
                }
            }
            
            // Refresh buildings list to get the latest data from backend
            // This ensures the new building appears immediately and bypasses any cache issues
            try {
                await dispatch(fetchBuildings()).unwrap();
                console.log("✅ Buildings list refreshed after creation");
            } catch (fetchError) {
                console.error("⚠️ Failed to refresh buildings list:", fetchError);
                // Don't block navigation if refresh fails
            }
            
            setIsSuccessOpen(true);
            navigate('/manager');
        } catch (error) {
            console.error("❌ Building creation failed:", error);
            
            // Extract error message with priority: userMessage > extractedMessage > response data > message
            let errorMessage = 'خطای نامشخص';
            
            if (typeof error === 'string') {
                errorMessage = error;
            } else if (error?.userMessage) {
                errorMessage = error.userMessage;
            } else if (error?.extractedMessage) {
                errorMessage = error.extractedMessage;
            } else if (error?.response?.data) {
                const data = error.response.data;
                if (typeof data === 'object') {
                    errorMessage = data.error || data.detail || data.message || JSON.stringify(data);
                } else if (typeof data === 'string') {
                    errorMessage = data;
                }
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            // Limit error message length for better UX
            if (errorMessage.length > 200) {
                errorMessage = errorMessage.substring(0, 200) + '...';
            }
            
            toast.error("خطا در ثبت ساختمان: " + errorMessage);
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
            community: "شهرک",
            building: "ساختمان",
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