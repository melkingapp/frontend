import { useState, useEffect } from "react";
import InputField from "../../../../../shared/components/shared/inputs/InputField";
import RadioGroup from "../../../../../shared/components/shared/inputs/RadioGroup";

export default function ComplexStructureForm({ formData, setFormData }) {
    const currentBlocksLength = (formData.complex_blocks || []).length;
    const [blocksCount, setBlocksCount] = useState(currentBlocksLength);

    // Initialize blocks array when count changes
    useEffect(() => {
        if (formData.complex_has_blocks === true) {
            const currentBlocks = formData.complex_blocks || [];
            if (currentBlocks.length !== blocksCount) {
                const newBlocks = [...currentBlocks];
                if (currentBlocks.length < blocksCount) {
                    for (let i = currentBlocks.length; i < blocksCount; i++) {
                        newBlocks.push({
                            name: "",
                            buildings_count: "",
                            buildings: [],
                        });
                    }
                } else {
                    newBlocks.splice(blocksCount);
                }
                setFormData((prev) => ({
                    ...prev,
                    complex_blocks: newBlocks,
                }));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blocksCount]);

    const handleBlockBuildingsCountChange = (blockIndex, buildingsCount) => {
        const blocks = [...(formData.complex_blocks || [])];
        blocks[blockIndex].buildings_count = buildingsCount;
        
        // Initialize buildings array
        if (buildingsCount > 0) {
            const currentBuildings = blocks[blockIndex].buildings || [];
            if (currentBuildings.length < buildingsCount) {
                const newBuildings = [...currentBuildings];
                for (let i = currentBuildings.length; i < buildingsCount; i++) {
                    newBuildings.push({ name: "", unit_count: "" });
                }
                blocks[blockIndex].buildings = newBuildings;
            } else if (currentBuildings.length > buildingsCount) {
                blocks[blockIndex].buildings = currentBuildings.slice(0, buildingsCount);
            }
        } else {
            blocks[blockIndex].buildings = [];
        }
        
        setFormData({
            ...formData,
            complex_blocks: blocks,
        });
    };

    const handleDirectBuildingsCountChange = (buildingsCount) => {
        const currentBuildings = formData.complex_direct_buildings || [];
        let newBuildings = [...currentBuildings];
        
        if (currentBuildings.length < buildingsCount) {
            for (let i = currentBuildings.length; i < buildingsCount; i++) {
                newBuildings.push({ name: "", unit_count: "" });
            }
        } else if (currentBuildings.length > buildingsCount) {
            newBuildings = newBuildings.slice(0, buildingsCount);
        }
        
        setFormData({
            ...formData,
            complex_direct_buildings_count: buildingsCount,
            complex_direct_buildings: newBuildings,
        });
    };

    return (
        <div className="space-y-6 mt-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800">ساختار مجتمع</h3>

            {/* Does complex include blocks? */}
            <RadioGroup
                label="آیا مجتمع شامل بلوک است؟"
                name="complex_has_blocks"
                options={[
                    { value: "yes", label: "بله" },
                    { value: "no", label: "خیر" },
                ]}
                value={formData.complex_has_blocks === true ? "yes" : formData.complex_has_blocks === false ? "no" : ""}
                onChange={(e) => {
                    const hasBlocks = e.target.value === "yes";
                    setFormData({
                        ...formData,
                        complex_has_blocks: hasBlocks,
                        complex_blocks: hasBlocks ? formData.complex_blocks || [] : [],
                        complex_direct_buildings: hasBlocks ? [] : formData.complex_direct_buildings || [],
                        complex_direct_buildings_count: hasBlocks ? "" : formData.complex_direct_buildings_count || "",
                    });
                    if (hasBlocks) {
                        setBlocksCount(0);
                    }
                }}
            />

            {/* If complex includes blocks */}
            {formData.complex_has_blocks === true && (
                <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <InputField
                        label="تعداد بلوک‌ها"
                        type="number"
                        placeholder="مثلاً 3"
                        value={blocksCount}
                        onChange={(e) => {
                            const count = parseInt(e.target.value) || 0;
                            setBlocksCount(count);
                        }}
                        required
                    />

                    {/* For each block */}
                    {(formData.complex_blocks || []).map((block, blockIndex) => (
                        <div key={blockIndex} className="space-y-3 bg-white p-4 rounded-lg border border-gray-300">
                            <h5 className="font-semibold text-gray-700">بلوک {blockIndex + 1}</h5>

                            <InputField
                                label="نام بلوک"
                                placeholder={`مثلاً بلوک ${blockIndex + 1}`}
                                value={block.name || ""}
                                onChange={(e) => {
                                    const blocks = [...(formData.complex_blocks || [])];
                                    blocks[blockIndex].name = e.target.value;
                                    setFormData({
                                        ...formData,
                                        complex_blocks: blocks,
                                    });
                                }}
                                required
                            />

                            <InputField
                                label="تعداد ساختمان‌ها"
                                type="number"
                                placeholder="مثلاً 5"
                                value={block.buildings_count || ""}
                                onChange={(e) => {
                                    const count = parseInt(e.target.value) || 0;
                                    handleBlockBuildingsCountChange(blockIndex, count);
                                }}
                                required
                            />

                            {/* For each building in block */}
                            {(block.buildings || []).map((building, buildingIndex) => (
                                <div key={buildingIndex} className="bg-gray-50 p-3 rounded space-y-2">
                                    <InputField
                                        label={`نام ساختمان ${buildingIndex + 1}`}
                                        placeholder={`مثلاً ساختمان ${buildingIndex + 1}`}
                                        value={building.name || ""}
                                        onChange={(e) => {
                                            const blocks = [...(formData.complex_blocks || [])];
                                            blocks[blockIndex].buildings[buildingIndex].name = e.target.value;
                                            setFormData({
                                                ...formData,
                                                complex_blocks: blocks,
                                            });
                                        }}
                                        required
                                    />
                                    <InputField
                                        label={`تعداد واحد ساختمان ${buildingIndex + 1}`}
                                        type="number"
                                        placeholder="مثلاً 10"
                                        min="1"
                                        value={building.unit_count || ""}
                                        onChange={(e) => {
                                            const blocks = [...(formData.complex_blocks || [])];
                                            blocks[blockIndex].buildings[buildingIndex].unit_count = e.target.value;
                                            setFormData({
                                                ...formData,
                                                complex_blocks: blocks,
                                            });
                                        }}
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {/* If complex doesn't include blocks - has direct buildings */}
            {formData.complex_has_blocks === false && (
                <div className="space-y-4 bg-green-50 p-4 rounded-lg border border-green-200">
                    <InputField
                        label="تعداد ساختمان‌ها"
                        type="number"
                        placeholder="مثلاً 10"
                        value={formData.complex_direct_buildings_count || ""}
                        onChange={(e) => {
                            const count = parseInt(e.target.value) || 0;
                            handleDirectBuildingsCountChange(count);
                        }}
                        required
                    />

                    {/* For each direct building */}
                    {(formData.complex_direct_buildings || []).map((building, buildingIndex) => (
                        <div key={buildingIndex} className="bg-white p-3 rounded border border-gray-200 space-y-2">
                            <InputField
                                label={`نام ساختمان ${buildingIndex + 1}`}
                                placeholder={`مثلاً ساختمان ${buildingIndex + 1}`}
                                value={building.name || ""}
                                onChange={(e) => {
                                    const buildings = [...(formData.complex_direct_buildings || [])];
                                    buildings[buildingIndex].name = e.target.value;
                                    setFormData({
                                        ...formData,
                                        complex_direct_buildings: buildings,
                                    });
                                }}
                                required
                            />
                            <InputField
                                label={`تعداد واحد ساختمان ${buildingIndex + 1}`}
                                type="number"
                                placeholder="مثلاً 10"
                                min="1"
                                value={building.unit_count || ""}
                                onChange={(e) => {
                                    const buildings = [...(formData.complex_direct_buildings || [])];
                                    buildings[buildingIndex].unit_count = e.target.value;
                                    setFormData({
                                        ...formData,
                                        complex_direct_buildings: buildings,
                                    });
                                }}
                                required
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

