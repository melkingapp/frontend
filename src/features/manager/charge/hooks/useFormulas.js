import { useEffect } from "react";
import { getChargeFormulas } from "../../../../shared/services/billingService";
import { toast } from "sonner";

/**
 * Custom hook for managing charge formulas
 */
export const useFormulas = (building, setIsLoadingFormulas, setFormulas) => {
  // Fetch charge formulas when building is available
  useEffect(() => {
    const fetchFormulas = async () => {
      const buildingId = building?.building_id || building?.id;
      if (!buildingId) {
        setFormulas([]);
        return;
      }

      setIsLoadingFormulas(true);
      try {
        const formulasData = await getChargeFormulas(buildingId);
        // Map API response to frontend format
        const mappedFormulas = formulasData.map(formula => ({
          id: formula.formula_id,
          formula_id: formula.formula_id,
          name: formula.name,
          baseAmount: formula.base_amount,
          params: formula.params || {
            baseAmount: formula.base_amount,
            perPerson: { enabled: false, amount: '', conditionValue: '', conditionType: 'always' },
            perArea: { enabled: false, amount: '', conditionValue: '', conditionType: 'always' },
            perParking: { enabled: false, amount: '', conditionValue: '', conditionType: 'always' },
            perStorageArea: { enabled: false, amount: '', conditionValue: '', conditionType: 'always' },
          },
          created_at: formula.created_at,
        }));
        setFormulas(mappedFormulas);
      } catch (error) {
        console.error('Error fetching charge formulas:', error);
        const errorMessage = error.response?.data?.error || error.message || 'خطا در دریافت فرمول‌ها';
        toast.error(errorMessage);
        setFormulas([]);
      } finally {
        setIsLoadingFormulas(false);
      }
    };

    fetchFormulas();
  }, [building?.building_id, building?.id, setIsLoadingFormulas, setFormulas]);
};

