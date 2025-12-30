import { useState } from "react";
import StepInfo from "../components/steps/StepInfo";
import StepOwnerResidence from "../components/steps/StepOwnerResidence";
import StepFund from "../components/steps/StepFund";
import StepSummary from "../components/steps/StepSummary";
import Stepper from "../components/Stepper";

export default function CreateBuildingForm() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: "",
        name: "",
        usage_type: "residential",
        property_type: "building",
        unit_count: "",
        is_owner_resident: false,
        resident_floor: "",
        fund_balance: "",
        fund_sheba_number: "",
        blocks_count: "",
        // Block hierarchical structure
        block_buildings: [],
        block_buildings_count: "",
        // Complex hierarchical structure
        complex_has_blocks: null,
        complex_blocks: [],
        complex_direct_buildings: [],
        complex_direct_buildings_count: "",
        // Community (Township) hierarchical structure
        community_has_complex: null,
        community_total_buildings: "",
        community_complexes: [],
        community_has_blocks: null,
        community_blocks: [],
        community_direct_buildings: [],
        community_direct_buildings_count: "",
    });

    const next = () => setStep((prev) => prev + 1);
    const prev = () => setStep((prev) => prev - 1);

    return (
        <div className="max-w-2xl mx-auto p-6 rounded-xl shadow bg-white">
            <Stepper currentStep={step} />

            <div className="mt-8">
                {step === 1 && <StepInfo formData={formData} setFormData={setFormData} next={next} />}
                {step === 2 && <StepOwnerResidence formData={formData} setFormData={setFormData} next={next} prev={prev} />}
                {step === 3 && <StepFund formData={formData} setFormData={setFormData} next={next} prev={prev} />}
                {step === 4 && <StepSummary formData={formData} prev={prev} />}
            </div>
        </div>
    );
}
