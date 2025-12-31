import InputField from "../../../../../shared/components/shared/inputs/InputField";
import SelectField from "../../../../../shared/components/shared/inputs/SelectField";
import StepNavigation from "./StepNavigation";
import CommunityStructureForm from "./CommunityStructureForm";
import ComplexStructureForm from "./ComplexStructureForm";
import BlockStructureForm from "./BlockStructureForm";

// Helper function to validate community hierarchical structure
const validateCommunityStructure = (formData) => {
    // If not community, skip validation
    if (formData.property_type !== "community") {
        return true;
    }

    // Must have answered: does community include complexes?
    if (formData.community_has_complex === null || formData.community_has_complex === undefined) {
        return false;
    }

    // Case A: Community includes complexes
    if (formData.community_has_complex === true) {
        const complexes = formData.community_complexes || [];
        if (complexes.length === 0) {
            return false;
        }

        // Validate each complex
        for (const complex of complexes) {
            // Complex name is required
            if (!complex.name || !complex.name.trim()) {
                return false;
            }

            // Must have answered: does complex include blocks?
            if (complex.has_blocks === null || complex.has_blocks === undefined) {
                return false;
            }

            // If complex includes blocks
            if (complex.has_blocks === true) {
                const blocks = complex.blocks || [];
                const blocksCount = parseInt(complex.blocks_count) || 0;
                if (blocksCount === 0 || blocks.length !== blocksCount) {
                    return false;
                }

                // Validate each block
                for (const block of blocks) {
                    // Block name is required
                    if (!block.name || !block.name.trim()) {
                        return false;
                    }

                    // Buildings count is required
                    const buildingsCount = parseInt(block.buildings_count) || 0;
                    if (buildingsCount === 0) {
                        return false;
                    }

                    // Validate each building
                    const buildings = block.buildings || [];
                    if (buildings.length !== buildingsCount) {
                        return false;
                    }

                    for (const building of buildings) {
                        if (!building.name || !building.name.trim()) {
                            return false;
                        }
                        // For complex -> block -> building structure, unit_count is required for each building
                        const unitCount = parseInt(building.unit_count) || 0;
                        if (unitCount <= 0) {
                            return false;
                        }
                    }
                }
            } else {
                // Complex doesn't include blocks - has direct buildings
                const buildingsCount = parseInt(complex.buildings_count) || 0;
                if (buildingsCount === 0) {
                    return false;
                }

                const buildings = complex.buildings || [];
                if (buildings.length !== buildingsCount) {
                    return false;
                }

                // Validate each building
                for (const building of buildings) {
                    if (!building.name || !building.name.trim()) {
                        return false;
                    }
                    // unit_count is required for each building
                    const unitCount = parseInt(building.unit_count) || 0;
                    if (unitCount <= 0) {
                        return false;
                    }
                }
            }
        }
    } else {
        // Case B: Community doesn't include complexes
        // Must have answered: does community include blocks?
        if (formData.community_has_blocks === null || formData.community_has_blocks === undefined) {
            return false;
        }

        // If community includes blocks
        if (formData.community_has_blocks === true) {
            const blocks = formData.community_blocks || [];
            if (blocks.length === 0) {
                return false;
            }

            // Validate each block
            for (const block of blocks) {
                // Block name is required
                if (!block.name || !block.name.trim()) {
                    return false;
                }

                // Buildings count is required
                const buildingsCount = parseInt(block.buildings_count) || 0;
                if (buildingsCount === 0) {
                    return false;
                }

                // Validate each building
                const buildings = block.buildings || [];
                if (buildings.length !== buildingsCount) {
                    return false;
                }

                for (const building of buildings) {
                    if (!building.name || !building.name.trim()) {
                        return false;
                    }
                    // unit_count is required for each building
                    const unitCount = parseInt(building.unit_count) || 0;
                    if (unitCount <= 0) {
                        return false;
                    }
                }
            }
        } else {
            // Community doesn't include blocks - has direct buildings
            const buildingsCount = parseInt(formData.community_direct_buildings_count) || 0;
            if (buildingsCount === 0) {
                return false;
            }

            const buildings = formData.community_direct_buildings || [];
            if (buildings.length !== buildingsCount) {
                return false;
            }

            // Validate each building
            for (const building of buildings) {
                if (!building.name || !building.name.trim()) {
                    return false;
                }
                // unit_count is required for each building
                const unitCount = parseInt(building.unit_count) || 0;
                if (unitCount <= 0) {
                    return false;
                }
            }
        }
    }

    return true;
};

// Helper function to validate complex hierarchical structure
const validateComplexStructure = (formData) => {
    // If not complex, skip validation
    if (formData.property_type !== "complex") {
        return true;
    }

    // Must have answered: does complex include blocks?
    if (formData.complex_has_blocks === null || formData.complex_has_blocks === undefined) {
        return false;
    }

    // If complex includes blocks
    if (formData.complex_has_blocks === true) {
        const blocks = formData.complex_blocks || [];
        if (blocks.length === 0) {
            return false;
        }

        // Validate each block
        for (const block of blocks) {
            // Block name is required
            if (!block.name || !block.name.trim()) {
                return false;
            }

            // Buildings count is required
            const buildingsCount = parseInt(block.buildings_count) || 0;
            if (buildingsCount === 0) {
                return false;
            }

            // Validate each building
            const buildings = block.buildings || [];
            if (buildings.length !== buildingsCount) {
                return false;
            }

            for (const building of buildings) {
                if (!building.name || !building.name.trim()) {
                    return false;
                }
                // unit_count is required for each building
                const unitCount = parseInt(building.unit_count) || 0;
                if (unitCount <= 0) {
                    return false;
                }
            }
        }
    } else {
        // Complex doesn't include blocks - has direct buildings
        const buildingsCount = parseInt(formData.complex_direct_buildings_count) || 0;
        if (buildingsCount === 0) {
            return false;
        }

        const buildings = formData.complex_direct_buildings || [];
        if (buildings.length !== buildingsCount) {
            return false;
        }

        // Validate each building
        for (const building of buildings) {
            if (!building.name || !building.name.trim()) {
                return false;
            }
            // unit_count is required for each building
            const unitCount = parseInt(building.unit_count) || 0;
            if (unitCount <= 0) {
                return false;
            }
        }
    }

    return true;
};

// Helper function to validate block structure
const validateBlockStructure = (formData) => {
    // If not block, skip validation
    if (formData.property_type !== "block") {
        return true;
    }

    const buildings = formData.block_buildings || [];
    const buildingsCount = parseInt(formData.block_buildings_count) || 0;
    
    if (buildingsCount === 0 || buildings.length !== buildingsCount) {
        return false;
    }

    // Validate each building
    for (const building of buildings) {
        if (!building.name || !building.name.trim()) {
            return false;
        }
        // unit_count is required for each building
        const unitCount = parseInt(building.unit_count) || 0;
        if (unitCount <= 0) {
            return false;
        }
    }

    return true;
};

// Helper function to check if structure should hide unit_count field
const shouldHideUnitCount = (formData) => {
    // For community -> complex -> block -> building structure
    if (formData.property_type === "community") {
        if (formData.community_has_complex === true) {
            const complexes = formData.community_complexes || [];
            if (complexes.length > 0) {
                // Check if at least one complex has blocks with buildings
                if (complexes.some(complex => complex.has_blocks === true && (complex.blocks || []).length > 0)) {
                    return true;
                }
            }
        }
    }
    
    // For complex structure (with or without blocks)
    if (formData.property_type === "complex") {
        if (formData.complex_has_blocks !== null && formData.complex_has_blocks !== undefined) {
            return true;
        }
    }
    
    // For block structure (always has buildings)
    if (formData.property_type === "block") {
        return true;
    }
    
    return false;
};

export default function StepInfo({ formData, setFormData, next }) {
    const hideUnitCount = shouldHideUnitCount(formData);
    
    const isBasicValid =
        formData.title &&
        formData.usage_type &&
        formData.property_type &&
        (hideUnitCount || formData.unit_count);

    const isComplexValid = validateComplexStructure(formData);
    const isBlockValid = validateBlockStructure(formData);
    const isCommunityValid = validateCommunityStructure(formData);

    const isValid = isBasicValid && isComplexValid && isBlockValid && isCommunityValid;

    return (
        <div className="flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-10 border border-gray-200">
                <h2
                    className="text-2xl font-bold text-center mb-10 text-melkingDarkBlue">
                    مرحله ۱: مشخصات کلی ملک
                </h2>

                <div className="space-y-6">
                    {/* فیلدهای ورودی */}
                    <InputField
                        label="عنوان ساختمان"
                        placeholder="مثلاً برج نیکان"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />

                    <SelectField
                        label="کاربری ساختمان"
                        value={formData.usage_type}
                        onChange={(e) => setFormData({ ...formData, usage_type: e.target.value })}
                        options={[
                            { value: "residential", label: "مسکونی" },
                            { value: "commercial", label: "تجاری" },
                            { value: "office", label: "اداری" },
                            { value: "other", label: "سایر" },
                        ]}
                    />

                    <SelectField
                        label="نوع ملک"
                        value={formData.property_type}
                        onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                        options={[
                            { value: "block", label: "بلوک" },
                            { value: "tower", label: "برج" },
                            { value: "complex", label: "مجتمع" },
                            { value: "community", label: "شهرک" },
                            { value: "building", label: "ساختمان" },
                        ]}
                    />

                    {formData.property_type === "block" && (
                        <BlockStructureForm formData={formData} setFormData={setFormData} />
                    )}

                    {formData.property_type === "complex" && (
                        <ComplexStructureForm formData={formData} setFormData={setFormData} />
                    )}

                    {formData.property_type === "community" && (
                        <CommunityStructureForm formData={formData} setFormData={setFormData} />
                    )}

                    {!hideUnitCount && (
                        <InputField
                            label="تعداد واحد"
                            type="number"
                            placeholder="مثلاً ۱۰"
                            value={formData.unit_count}
                            onChange={(e) => setFormData({ ...formData, unit_count: e.target.value })}
                        />
                    )}
                </div>

                <StepNavigation
                    onPrev={null} 
                    onNext={next}
                    isNextDisabled={!isValid}
                    hidePrev={true} 
                    nextLabel="مرحله بعد"
                />

            </div>
        </div>
    );
}
