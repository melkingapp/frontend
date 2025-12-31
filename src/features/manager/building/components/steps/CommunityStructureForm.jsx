import { useState, useEffect } from "react";
import InputField from "../../../../../shared/components/shared/inputs/InputField";
import RadioGroup from "../../../../../shared/components/shared/inputs/RadioGroup";

export default function CommunityStructureForm({ formData, setFormData }) {
    const currentComplexesLength = (formData.community_complexes || []).length;
    const currentBlocksLength = (formData.community_blocks || []).length;
    
    const [complexesCount, setComplexesCount] = useState(currentComplexesLength);
    const [blocksCount, setBlocksCount] = useState(currentBlocksLength);

    // Initialize complexes array when count changes
    useEffect(() => {
        if (formData.community_has_complex === true) {
            const currentComplexes = formData.community_complexes || [];
            if (currentComplexes.length !== complexesCount) {
                const newComplexes = [...currentComplexes];
                if (currentComplexes.length < complexesCount) {
                    for (let i = currentComplexes.length; i < complexesCount; i++) {
                        newComplexes.push({
                            name: "",
                            has_blocks: null,
                            blocks_count: "",
                            blocks: [],
                            buildings_count: "",
                            buildings: [],
                        });
                    }
                } else {
                    newComplexes.splice(complexesCount);
                }
                setFormData((prev) => ({
                    ...prev,
                    community_complexes: newComplexes,
                }));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [complexesCount]);

    // Initialize blocks array when no complex and blocks count changes
    useEffect(() => {
        if (formData.community_has_complex === false && formData.community_has_blocks === true) {
            const currentBlocks = formData.community_blocks || [];
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
                    community_blocks: newBlocks,
                }));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blocksCount]);

    const handleComplexBlockCountChange = (complexIndex, blocksCount) => {
        const complexes = [...(formData.community_complexes || [])];
        complexes[complexIndex].blocks_count = blocksCount;
        
        // Initialize blocks array
        if (blocksCount > 0) {
            const currentBlocks = complexes[complexIndex].blocks || [];
            if (currentBlocks.length < blocksCount) {
                const newBlocks = [...currentBlocks];
                for (let i = currentBlocks.length; i < blocksCount; i++) {
                    newBlocks.push({
                        name: "",
                        buildings_count: "",
                        buildings: [],
                    });
                }
                complexes[complexIndex].blocks = newBlocks;
            } else if (currentBlocks.length > blocksCount) {
                complexes[complexIndex].blocks = currentBlocks.slice(0, blocksCount);
            }
        } else {
            complexes[complexIndex].blocks = [];
        }
        
        setFormData({
            ...formData,
            community_complexes: complexes,
        });
    };

    const handleBlockBuildingsCountChange = (blockIndex, buildingsCount, complexIndex = null) => {
        if (complexIndex !== null) {
            // Block inside a complex
            const complexes = [...(formData.community_complexes || [])];
            const blocks = [...(complexes[complexIndex].blocks || [])];
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
            
            complexes[complexIndex].blocks = blocks;
            setFormData({
                ...formData,
                community_complexes: complexes,
            });
        } else {
            // Block directly under community (no complex)
            const blocks = [...(formData.community_blocks || [])];
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
                community_blocks: blocks,
            });
        }
    };

    const handleComplexBuildingsCountChange = (complexIndex, buildingsCount) => {
        const complexes = [...(formData.community_complexes || [])];
        complexes[complexIndex].buildings_count = buildingsCount;
        
        // Initialize buildings array
        if (buildingsCount > 0) {
            const currentBuildings = complexes[complexIndex].buildings || [];
            if (currentBuildings.length < buildingsCount) {
                const newBuildings = [...currentBuildings];
                for (let i = currentBuildings.length; i < buildingsCount; i++) {
                    newBuildings.push({ name: "" });
                }
                complexes[complexIndex].buildings = newBuildings;
            } else if (currentBuildings.length > buildingsCount) {
                complexes[complexIndex].buildings = currentBuildings.slice(0, buildingsCount);
            }
        } else {
            complexes[complexIndex].buildings = [];
        }
        
        setFormData({
            ...formData,
            community_complexes: complexes,
        });
    };

    return (
        <div className="space-y-6 mt-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800">ساختار شهرک</h3>

            {/* Total Buildings (Optional but recommended) */}
            <InputField
                label="تعداد کل ساختمان‌ها (اختیاری)"
                type="number"
                placeholder="مثلاً 50"
                value={formData.community_total_buildings || ""}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        community_total_buildings: e.target.value,
                    })
                }
            />

            {/* Does community include complexes? */}
            <RadioGroup
                label="آیا شهرک شامل «مجتمع» است؟"
                name="community_has_complex"
                options={[
                    { value: "yes", label: "بله" },
                    { value: "no", label: "خیر" },
                ]}
                value={formData.community_has_complex === true ? "yes" : formData.community_has_complex === false ? "no" : ""}
                onChange={(e) => {
                    const hasComplex = e.target.value === "yes";
                    setFormData({
                        ...formData,
                        community_has_complex: hasComplex,
                        community_complexes: hasComplex ? formData.community_complexes || [] : [],
                        community_has_blocks: hasComplex ? null : formData.community_has_blocks,
                        community_blocks: hasComplex ? [] : formData.community_blocks || [],
                    });
                    if (hasComplex) {
                        setComplexesCount(0);
                    } else {
                        setBlocksCount(0);
                    }
                }}
            />

            {/* Case A: Community includes complexes */}
            {formData.community_has_complex === true && (
                <div className="space-y-6 bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <h4 className="text-md font-semibold text-gray-700">اطلاعات مجتمع‌ها</h4>

                    {/* Number of complexes */}
                    <InputField
                        label="تعداد مجتمع‌ها"
                        type="number"
                        placeholder="مثلاً 3"
                        value={complexesCount}
                        onChange={(e) => {
                            const count = parseInt(e.target.value) || 0;
                            setComplexesCount(count);
                        }}
                        required
                    />

                    {/* For each complex */}
                    {(formData.community_complexes || []).map((complex, complexIndex) => (
                        <div key={complexIndex} className="space-y-4 bg-white p-4 rounded-lg border border-gray-300">
                            <h5 className="font-semibold text-gray-700">مجتمع {complexIndex + 1}</h5>

                            {/* Complex name */}
                            <InputField
                                label="نام مجتمع"
                                placeholder={`مثلاً مجتمع ${complexIndex + 1}`}
                                value={complex.name || ""}
                                onChange={(e) => {
                                    const complexes = [...(formData.community_complexes || [])];
                                    complexes[complexIndex].name = e.target.value;
                                    setFormData({
                                        ...formData,
                                        community_complexes: complexes,
                                    });
                                }}
                                required
                            />

                            {/* Does complex include blocks? */}
                            <RadioGroup
                                label="آیا مجتمع شامل بلوک است؟"
                                name={`complex_${complexIndex}_has_blocks`}
                                options={[
                                    { value: "yes", label: "بله" },
                                    { value: "no", label: "خیر" },
                                ]}
                                value={complex.has_blocks === true ? "yes" : complex.has_blocks === false ? "no" : ""}
                                onChange={(e) => {
                                    const hasBlocks = e.target.value === "yes";
                                    const complexes = [...(formData.community_complexes || [])];
                                    complexes[complexIndex].has_blocks = hasBlocks;
                                    complexes[complexIndex].blocks_count = hasBlocks ? complexes[complexIndex].blocks_count : "";
                                    complexes[complexIndex].blocks = hasBlocks ? complexes[complexIndex].blocks || [] : [];
                                    complexes[complexIndex].buildings_count = hasBlocks ? "" : complexes[complexIndex].buildings_count;
                                    complexes[complexIndex].buildings = hasBlocks ? [] : complexes[complexIndex].buildings || [];
                                    setFormData({
                                        ...formData,
                                        community_complexes: complexes,
                                    });
                                }}
                            />

                            {/* If complex includes blocks */}
                            {complex.has_blocks === true && (
                                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <InputField
                                        label="تعداد بلوک‌ها"
                                        type="number"
                                        placeholder="مثلاً 2"
                                        value={complex.blocks_count || ""}
                                        onChange={(e) => {
                                            const count = parseInt(e.target.value) || 0;
                                            handleComplexBlockCountChange(complexIndex, count);
                                        }}
                                        required
                                    />

                                    {/* For each block in complex */}
                                    {(complex.blocks || []).map((block, blockIndex) => (
                                        <div key={blockIndex} className="space-y-3 bg-white p-3 rounded border border-gray-200">
                                            <h6 className="font-medium text-gray-600">بلوک {blockIndex + 1}</h6>

                                            <InputField
                                                label="نام بلوک"
                                                placeholder={`مثلاً بلوک ${blockIndex + 1}`}
                                                value={block.name || ""}
                                                onChange={(e) => {
                                                    const complexes = [...(formData.community_complexes || [])];
                                                    complexes[complexIndex].blocks[blockIndex].name = e.target.value;
                                                    setFormData({
                                                        ...formData,
                                                        community_complexes: complexes,
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
                                                    handleBlockBuildingsCountChange(blockIndex, count, complexIndex);
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
                                                            const complexes = [...(formData.community_complexes || [])];
                                                            complexes[complexIndex].blocks[blockIndex].buildings[buildingIndex].name = e.target.value;
                                                            setFormData({
                                                                ...formData,
                                                                community_complexes: complexes,
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
                                                            const complexes = [...(formData.community_complexes || [])];
                                                            complexes[complexIndex].blocks[blockIndex].buildings[buildingIndex].unit_count = e.target.value;
                                                            setFormData({
                                                                ...formData,
                                                                community_complexes: complexes,
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

                            {/* If complex doesn't include blocks */}
                            {complex.has_blocks === false && (
                                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <InputField
                                        label="تعداد ساختمان‌ها"
                                        type="number"
                                        placeholder="مثلاً 10"
                                        value={complex.buildings_count || ""}
                                        onChange={(e) => {
                                            const count = parseInt(e.target.value) || 0;
                                            handleComplexBuildingsCountChange(complexIndex, count);
                                        }}
                                        required
                                    />

                                    {/* For each building in complex */}
                                    {(complex.buildings || []).map((building, buildingIndex) => (
                                        <div key={buildingIndex} className="bg-white p-2 rounded border border-gray-200">
                                            <InputField
                                                label={`نام ساختمان ${buildingIndex + 1}`}
                                                placeholder={`مثلاً ساختمان ${buildingIndex + 1}`}
                                                value={building.name || ""}
                                                onChange={(e) => {
                                                    const complexes = [...(formData.community_complexes || [])];
                                                    complexes[complexIndex].buildings[buildingIndex].name = e.target.value;
                                                    setFormData({
                                                        ...formData,
                                                        community_complexes: complexes,
                                                    });
                                                }}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Case B: Community doesn't include complexes */}
            {formData.community_has_complex === false && (
                <div className="space-y-6 bg-green-50 p-4 rounded-xl border border-green-200">
                    <h4 className="text-md font-semibold text-gray-700">ساختار شهرک (بدون مجتمع)</h4>

                    {/* Does community include blocks? */}
                    <RadioGroup
                        label="آیا شهرک شامل بلوک است؟"
                        name="community_has_blocks"
                        options={[
                            { value: "yes", label: "بله" },
                            { value: "no", label: "خیر" },
                        ]}
                        value={formData.community_has_blocks === true ? "yes" : formData.community_has_blocks === false ? "no" : ""}
                        onChange={(e) => {
                            const hasBlocks = e.target.value === "yes";
                            setFormData({
                                ...formData,
                                community_has_blocks: hasBlocks,
                                community_blocks: hasBlocks ? formData.community_blocks || [] : [],
                                community_direct_buildings: hasBlocks ? [] : formData.community_direct_buildings || [],
                            });
                            if (hasBlocks) {
                                setBlocksCount(0);
                            }
                        }}
                    />

                    {/* If community includes blocks */}
                    {formData.community_has_blocks === true && (
                        <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-300">
                            <InputField
                                label="تعداد بلوک‌ها"
                                type="number"
                                placeholder="مثلاً 5"
                                value={blocksCount}
                                onChange={(e) => {
                                    const count = parseInt(e.target.value) || 0;
                                    setBlocksCount(count);
                                }}
                                required
                            />

                            {/* For each block */}
                            {(formData.community_blocks || []).map((block, blockIndex) => (
                                <div key={blockIndex} className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h5 className="font-semibold text-gray-700">بلوک {blockIndex + 1}</h5>

                                    <InputField
                                        label="نام بلوک"
                                        placeholder={`مثلاً بلوک ${blockIndex + 1}`}
                                        value={block.name || ""}
                                        onChange={(e) => {
                                            const blocks = [...(formData.community_blocks || [])];
                                            blocks[blockIndex].name = e.target.value;
                                            setFormData({
                                                ...formData,
                                                community_blocks: blocks,
                                            });
                                        }}
                                        required
                                    />

                                    <InputField
                                        label="تعداد ساختمان‌ها"
                                        type="number"
                                        placeholder="مثلاً 4"
                                        value={block.buildings_count || ""}
                                        onChange={(e) => {
                                            const count = parseInt(e.target.value) || 0;
                                            handleBlockBuildingsCountChange(blockIndex, count);
                                        }}
                                        required
                                    />

                                    {/* For each building in block */}
                                    {(block.buildings || []).map((building, buildingIndex) => (
                                        <div key={buildingIndex} className="bg-white p-2 rounded border border-gray-200 space-y-2">
                                            <InputField
                                                label={`نام ساختمان ${buildingIndex + 1}`}
                                                placeholder={`مثلاً ساختمان ${buildingIndex + 1}`}
                                                value={building.name || ""}
                                                onChange={(e) => {
                                                    const blocks = [...(formData.community_blocks || [])];
                                                    blocks[blockIndex].buildings[buildingIndex].name = e.target.value;
                                                    setFormData({
                                                        ...formData,
                                                        community_blocks: blocks,
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
                                                    const blocks = [...(formData.community_blocks || [])];
                                                    blocks[blockIndex].buildings[buildingIndex].unit_count = e.target.value;
                                                    setFormData({
                                                        ...formData,
                                                        community_blocks: blocks,
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

                    {/* If community doesn't include blocks */}
                    {formData.community_has_blocks === false && (
                        <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-300">
                            <InputField
                                label="تعداد ساختمان‌ها"
                                type="number"
                                placeholder="مثلاً 20"
                                value={formData.community_direct_buildings_count || ""}
                                onChange={(e) => {
                                    const count = parseInt(e.target.value) || 0;
                                    const currentBuildings = formData.community_direct_buildings || [];
                                    let newBuildings = [...currentBuildings];
                                    
                                    if (currentBuildings.length < count) {
                                        for (let i = currentBuildings.length; i < count; i++) {
                                            newBuildings.push({ name: "" });
                                        }
                                    } else if (currentBuildings.length > count) {
                                        newBuildings = newBuildings.slice(0, count);
                                    }
                                    
                                    setFormData({
                                        ...formData,
                                        community_direct_buildings_count: count,
                                        community_direct_buildings: newBuildings,
                                    });
                                }}
                                required
                            />

                            {/* For each direct building */}
                            {(formData.community_direct_buildings || []).map((building, buildingIndex) => (
                                <div key={buildingIndex} className="bg-gray-50 p-2 rounded border border-gray-200">
                                    <InputField
                                        label={`نام ساختمان ${buildingIndex + 1}`}
                                        placeholder={`مثلاً ساختمان ${buildingIndex + 1}`}
                                        value={building.name || ""}
                                        onChange={(e) => {
                                            const buildings = [...(formData.community_direct_buildings || [])];
                                            buildings[buildingIndex].name = e.target.value;
                                            setFormData({
                                                ...formData,
                                                community_direct_buildings: buildings,
                                            });
                                        }}
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

