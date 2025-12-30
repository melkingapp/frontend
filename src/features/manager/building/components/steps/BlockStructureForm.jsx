import { useState, useEffect } from "react";
import InputField from "../../../../../shared/components/shared/inputs/InputField";

export default function BlockStructureForm({ formData, setFormData }) {
    const currentBuildingsLength = (formData.block_buildings || []).length;
    const [buildingsCount, setBuildingsCount] = useState(formData.block_buildings_count || currentBuildingsLength);

    // Initialize buildings array when count changes
    useEffect(() => {
        const currentBuildings = formData.block_buildings || [];
        if (currentBuildings.length !== buildingsCount) {
            const newBuildings = [...currentBuildings];
            if (currentBuildings.length < buildingsCount) {
                for (let i = currentBuildings.length; i < buildingsCount; i++) {
                    newBuildings.push({ name: "", unit_count: "" });
                }
            } else {
                newBuildings.splice(buildingsCount);
            }
            setFormData((prev) => ({
                ...prev,
                block_buildings_count: buildingsCount,
                block_buildings: newBuildings,
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buildingsCount]);

    return (
        <div className="space-y-6 mt-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800">ساختار بلوک</h3>

            <InputField
                label="تعداد ساختمان‌ها"
                type="number"
                placeholder="مثلاً 5"
                value={buildingsCount || ""}
                onChange={(e) => {
                    const count = parseInt(e.target.value) || 0;
                    setBuildingsCount(count);
                }}
                required
            />

            {/* For each building */}
            {(formData.block_buildings || []).map((building, buildingIndex) => (
                <div key={buildingIndex} className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                    <h5 className="font-semibold text-gray-700">ساختمان {buildingIndex + 1}</h5>
                    
                    <InputField
                        label="نام ساختمان"
                        placeholder={`مثلاً ساختمان ${buildingIndex + 1}`}
                        value={building.name || ""}
                        onChange={(e) => {
                            const buildings = [...(formData.block_buildings || [])];
                            buildings[buildingIndex].name = e.target.value;
                            setFormData({
                                ...formData,
                                block_buildings: buildings,
                            });
                        }}
                        required
                    />
                    
                    <InputField
                        label="تعداد واحد ساختمان"
                        type="number"
                        placeholder="مثلاً 10"
                        min="1"
                        value={building.unit_count || ""}
                        onChange={(e) => {
                            const buildings = [...(formData.block_buildings || [])];
                            buildings[buildingIndex].unit_count = e.target.value;
                            setFormData({
                                ...formData,
                                block_buildings: buildings,
                            });
                        }}
                        required
                    />
                </div>
            ))}
        </div>
    );
}

