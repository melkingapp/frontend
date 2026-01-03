import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
    const userPhone = useSelector((state) => state.auth.user?.phone_number || state.auth.user?.phone || state.auth.user?.username || '');

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
            
            // For hierarchical structures, unit_count validation is not needed
            const isHierarchical = ['community', 'complex', 'block'].includes(formData.property_type);
            
            if (!isHierarchical) {
                if (!formData.unit_count || parseInt(formData.unit_count) <= 0) {
                    toast.error("تعداد واحدها الزامی است و باید عدد مثبت باشد");
                    setIsLoading(false);
                    return;
                }
            }
            
            if (!formData.fund_balance || parseFloat(formData.fund_balance) < 0) {
                toast.error("موجودی اولیه صندوق الزامی است");
                setIsLoading(false);
                return;
            }
            
            // Clean form data for API
            // Ensure is_owner_resident is a boolean
            const is_owner_resident = Boolean(formData.is_owner_resident);
            
            // Check if this is a hierarchical structure (must be checked before blocks_count logic)
            const hasHierarchicalData = 
                (formData.property_type === 'community' && formData.community_has_complex !== null && formData.community_has_complex !== undefined) ||
                (formData.property_type === 'complex' && formData.complex_has_blocks !== null && formData.complex_has_blocks !== undefined) ||
                (formData.property_type === 'block' && formData.block_buildings_count);
            
            // Handle blocks_count: calculate from hierarchical structure or use provided value
            let blocks_count = null;
            if (formData.property_type === 'complex' || formData.property_type === 'community') {
                if (hasHierarchicalData) {
                    // Calculate blocks_count from hierarchical structure for backward compatibility
                    if (formData.property_type === 'community') {
                        if (formData.community_has_complex) {
                            // Count all blocks across all complexes
                            const complexes = formData.community_complexes || [];
                            blocks_count = complexes.reduce((total, complex) => {
                                if (complex.has_blocks) {
                                    return total + (complex.blocks?.length || 0);
                                }
                                return total;
                            }, 0);
                        } else if (formData.community_has_blocks) {
                            // Direct blocks in community
                            blocks_count = formData.community_blocks?.length || 0;
                        } else {
                            // No blocks, just direct buildings
                            blocks_count = 0;
                        }
                    } else if (formData.property_type === 'complex') {
                        if (formData.complex_has_blocks) {
                            blocks_count = formData.complex_blocks?.length || 0;
                        } else {
                            blocks_count = 0;
                        }
                    }
                    // Ensure at least 1 if there are blocks in the structure
                    if (blocks_count === 0 && (
                        (formData.community_complexes?.some(c => c.has_blocks && c.blocks?.length > 0)) ||
                        (formData.community_blocks?.length > 0) ||
                        (formData.complex_blocks?.length > 0)
                    )) {
                        blocks_count = 1;
                    }
                } else {
                    // Non-hierarchical: require blocks_count from form
                    const blocksCountValue = parseInt(formData.blocks_count);
                    if (isNaN(blocksCountValue) || blocksCountValue <= 0) {
                        toast.error("تعداد بلوک‌ها برای مجتمع/شهرک الزامی است و باید عدد مثبت باشد");
                        setIsLoading(false);
                        return;
                    }
                    blocks_count = blocksCountValue;
                }
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
            
            // For hierarchical structures, unit_count will be calculated automatically
            // For simple buildings, unit_count is required
            let unit_count = 0;
            
            if (!isHierarchical) {
                // For simple buildings, unit_count is required
                unit_count = parseInt(formData.unit_count);
                if (isNaN(unit_count) || unit_count <= 0) {
                    toast.error("تعداد واحدها باید عدد مثبت باشد");
                    setIsLoading(false);
                    return;
                }
            }
            
            const cleanData = {
                title: formData.title.trim(),
                usage_type: formData.usage_type,
                property_type: formData.property_type,
                unit_count: isHierarchical ? 0 : unit_count, // Will be calculated for hierarchical structures
                is_owner_resident: is_owner_resident,
                fund_balance: fund_balance,
            };
            
            // Only include fund_sheba_number if it exists and is not empty
            if (formData.fund_sheba_number && formData.fund_sheba_number.trim()) {
                cleanData.fund_sheba_number = formData.fund_sheba_number.trim();
            }
            
            // Only include resident_floor if is_owner_resident is true
            if (is_owner_resident) {
                cleanData.resident_floor = resident_floor;
            }
            
            // Include blocks_count if it's not null
            // For hierarchical structures, this is calculated from the structure
            // For non-hierarchical, it comes from the form
            if (blocks_count !== null && blocks_count !== undefined) {
                cleanData.blocks_count = blocks_count;
            }
            
            // Add hierarchical structure fields based on property_type
            // IMPORTANT: These fields must be added to cleanData so backend can detect hierarchical structure
            if (formData.property_type === 'community') {
                // Always include community_has_complex if it exists (even if false) so backend can detect hierarchical structure
                if (formData.community_has_complex !== null && formData.community_has_complex !== undefined) {
                    cleanData.community_has_complex = Boolean(formData.community_has_complex);
                    
                    if (formData.community_has_complex) {
                        // Community has complexes
                        if (formData.community_complexes && formData.community_complexes.length > 0) {
                            cleanData.community_complexes = formData.community_complexes;
                        }
                        if (formData.community_total_buildings) {
                            cleanData.community_total_buildings = formData.community_total_buildings;
                        }
                    } else {
                        // Community doesn't have complexes
                        if (formData.community_has_blocks !== null && formData.community_has_blocks !== undefined) {
                            cleanData.community_has_blocks = formData.community_has_blocks;
                            
                            if (formData.community_has_blocks) {
                                // Community has direct blocks
                                if (formData.community_blocks && formData.community_blocks.length > 0) {
                                    cleanData.community_blocks = formData.community_blocks;
                                }
                            } else {
                                // Community has direct buildings
                                if (formData.community_direct_buildings && formData.community_direct_buildings.length > 0) {
                                    cleanData.community_direct_buildings = formData.community_direct_buildings;
                                }
                                if (formData.community_direct_buildings_count) {
                                    cleanData.community_direct_buildings_count = formData.community_direct_buildings_count;
                                }
                            }
                        }
                    }
                }
            } else if (formData.property_type === 'complex') {
                // Always include complex_has_blocks if it exists (even if false) so backend can detect hierarchical structure
                if (formData.complex_has_blocks !== null && formData.complex_has_blocks !== undefined) {
                    cleanData.complex_has_blocks = Boolean(formData.complex_has_blocks);
                    
                    if (formData.complex_has_blocks) {
                        // Complex has blocks
                        if (formData.complex_blocks && formData.complex_blocks.length > 0) {
                            cleanData.complex_blocks = formData.complex_blocks;
                        }
                    } else {
                        // Complex has direct buildings
                        if (formData.complex_direct_buildings && formData.complex_direct_buildings.length > 0) {
                            cleanData.complex_direct_buildings = formData.complex_direct_buildings;
                        }
                        if (formData.complex_direct_buildings_count) {
                            cleanData.complex_direct_buildings_count = formData.complex_direct_buildings_count;
                        }
                    }
                }
            } else if (formData.property_type === 'block') {
                if (formData.block_buildings && formData.block_buildings.length > 0) {
                    cleanData.block_buildings = formData.block_buildings;
                }
                // Always include block_buildings_count if it exists so backend can detect hierarchical structure
                if (formData.block_buildings_count !== null && formData.block_buildings_count !== undefined) {
                    cleanData.block_buildings_count = formData.block_buildings_count;
                }
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

                    // Get manager phone number from Redux state
                    if (!userPhone) {
                        toast.error("شماره تماس مدیر یافت نشد. لطفاً دوباره وارد شوید.");
                        return;
                    }

                    const unitData = {
                        unit_number: managerUnitNumber,
                        floor: parseInt(formData.manager_floor) || parseInt(formData.resident_floor) || 1,
                        area: formData.manager_area ? parseFloat(formData.manager_area) : null,
                        full_name: formData.name || '',
                        phone_number: userPhone, // شماره تماس مدیر از اطلاعات کاربر گرفته می‌شود
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

    // Helper function to render hierarchical structure
    const renderHierarchicalStructure = () => {
        if (formData.property_type === 'community') {
            if (formData.community_has_complex === true) {
                // Community with complexes
                const complexes = formData.community_complexes || [];
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700">ساختار شهرک:</h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                            <div className="text-sm text-gray-600">شهرک شامل {complexes.length} مجتمع</div>
                            {complexes.map((complex, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded p-3 space-y-2">
                                    <div className="font-medium text-gray-800">مجتمع {idx + 1}: {complex.name}</div>
                                    {complex.has_blocks === true ? (
                                        <div className="mr-4 space-y-2">
                                            <div className="text-sm text-gray-600">شامل {complex.blocks?.length || 0} بلوک</div>
                                            {(complex.blocks || []).map((block, blockIdx) => (
                                                <div key={blockIdx} className="mr-4 bg-gray-50 border border-gray-200 rounded p-2">
                                                    <div className="text-sm font-medium text-gray-700">بلوک {blockIdx + 1}: {block.name}</div>
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        {block.buildings?.length || 0} ساختمان
                                                        {block.buildings && block.buildings.length > 0 && (
                                                            <div className="mr-2 mt-1">
                                                                {block.buildings.map((b, bIdx) => (
                                                                    <div key={bIdx} className="text-xs text-gray-500">
                                                                        - {b.name} ({b.unit_count} واحد)
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mr-4">
                                            <div className="text-sm text-gray-600">شامل {complex.buildings?.length || 0} ساختمان مستقیم</div>
                                            {(complex.buildings || []).map((b, bIdx) => (
                                                <div key={bIdx} className="text-xs text-gray-500 mr-2">
                                                    - {b.name} ({b.unit_count} واحد)
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            } else if (formData.community_has_blocks === true) {
                // Community with direct blocks
                const blocks = formData.community_blocks || [];
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700">ساختار شهرک:</h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                            <div className="text-sm text-gray-600">شهرک شامل {blocks.length} بلوک مستقیم</div>
                            {blocks.map((block, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded p-3">
                                    <div className="font-medium text-gray-800">بلوک {idx + 1}: {block.name}</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        {block.buildings?.length || 0} ساختمان
                                        {block.buildings && block.buildings.length > 0 && (
                                            <div className="mr-2 mt-1">
                                                {block.buildings.map((b, bIdx) => (
                                                    <div key={bIdx} className="text-xs text-gray-500">
                                                        - {b.name} ({b.unit_count} واحد)
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            } else {
                // Community with direct buildings
                const buildings = formData.community_direct_buildings || [];
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700">ساختار شهرک:</h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="text-sm text-gray-600">شهرک شامل {buildings.length} ساختمان مستقیم</div>
                            <div className="mt-2 space-y-1">
                                {buildings.map((b, idx) => (
                                    <div key={idx} className="text-sm text-gray-700">
                                        - {b.name} ({b.unit_count} واحد)
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            }
        } else if (formData.property_type === 'complex') {
            if (formData.complex_has_blocks === true) {
                // Complex with blocks
                const blocks = formData.complex_blocks || [];
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700">ساختار مجتمع:</h3>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                            <div className="text-sm text-gray-600">مجتمع شامل {blocks.length} بلوک</div>
                            {blocks.map((block, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded p-3">
                                    <div className="font-medium text-gray-800">بلوک {idx + 1}: {block.name}</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        {block.buildings?.length || 0} ساختمان
                                        {block.buildings && block.buildings.length > 0 && (
                                            <div className="mr-2 mt-1">
                                                {block.buildings.map((b, bIdx) => (
                                                    <div key={bIdx} className="text-xs text-gray-500">
                                                        - {b.name} ({b.unit_count} واحد)
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            } else {
                // Complex with direct buildings
                const buildings = formData.complex_direct_buildings || [];
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700">ساختار مجتمع:</h3>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="text-sm text-gray-600">مجتمع شامل {buildings.length} ساختمان مستقیم</div>
                            <div className="mt-2 space-y-1">
                                {buildings.map((b, idx) => (
                                    <div key={idx} className="text-sm text-gray-700">
                                        - {b.name} ({b.unit_count} واحد)
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            }
        } else if (formData.property_type === 'block') {
            // Block with buildings
            const buildings = formData.block_buildings || [];
            return (
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700">ساختار بلوک:</h3>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="text-sm text-gray-600">بلوک شامل {buildings.length} ساختمان</div>
                        <div className="mt-2 space-y-1">
                            {buildings.map((b, idx) => (
                                <div key={idx} className="text-sm text-gray-700">
                                    - {b.name} ({b.unit_count} واحد)
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const entries = [
        { label: "عنوان ساختمان", value: formData.title },
        { label: "نام مدیر", value: formData.name || "-" },
        { label: "نوع کاربری", value: labelsMap.usage_type[formData.usage_type] || formData.usage_type },
        { label: "نوع ملک", value: labelsMap.property_type[formData.property_type] || formData.property_type },
        ...(formData.property_type !== 'community' && formData.property_type !== 'complex' && formData.property_type !== 'block'
            ? [{ label: "تعداد واحد", value: formData.unit_count }]
            : []),
        { label: "مدیر ساکن است؟", value: formData.is_owner_resident ? "بله" : "خیر" },
        ...(formData.is_owner_resident ? [{ label: "طبقه محل سکونت مدیر", value: formData.resident_floor || formData.manager_floor || "-" }] : []),
        { label: "موجودی اولیه صندوق", value: formatNumber(formData.fund_balance) },
        { label: "شماره شبا صندوق", value: formData.fund_sheba_number || "-" },
        ...(["complex", "community"].includes(formData.property_type)
            ? [{ label: "تعداد بلوک‌ها", value: formData.blocks_count || "-" }]
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

                {/* Hierarchical Structure Display */}
                {renderHierarchicalStructure()}

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