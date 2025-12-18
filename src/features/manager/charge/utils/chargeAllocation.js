/**
 * Helper function to determine charge allocation based on unit status and payer type
 * @param {Object} unit - Unit object with owner_type, is_occupied, tenant_full_name
 * @param {string} payerType - 'owner' or 'resident'
 * @returns {string} - 'owner' or 'resident'
 */
export const determineChargeAllocation = (unit, payerType) => {
  // اگر پرداخت‌کننده مالک باشد، همیشه به مالک اعمال می‌شود
  if (payerType === 'owner') {
    return 'owner';
  }

  // اگر پرداخت‌کننده ساکن باشد، منطق پیچیده‌تر است
  if (payerType === 'resident') {
    // حالت 1: اگر مالک خودش ساکن است → شارژ بر مالک اعمال شود
    if (unit.owner_type === 'resident') {
      return 'owner';
    }

    // حالت 2: اگر مالک با مستاجر دارد → شارژ مربوط به ساکن برای ساکن اعمال شود
    if (unit.owner_type === 'landlord' && unit.tenant_full_name) {
      return 'resident';
    }

    // حالت 3: اگر مالک بدون مستاجر است → شارژ مربوط به ساکن بر مالک اعمال شود
    if (unit.owner_type === 'landlord' && !unit.tenant_full_name) {
      return 'owner';
    }

    // حالت 4: اگر واحد خالی است → شارژ بر مالک اعمال شود
    if (unit.owner_type === 'empty' || !unit.owner_type) {
      return 'owner';
    }
  }

  // به صورت پیش‌فرض به مالک اعمال می‌شود
  return 'owner';
};

/**
 * Prepare charge allocation for each unit
 * @param {Object} formData - Form data with payerType, targetUnits, selectedUnits
 * @param {Array} buildingUnits - List of building units
 * @returns {Object} - Allocations object with unitId as key
 */
export const prepareChargeAllocations = (formData, buildingUnits) => {
  const allocations = {};
  const payerType = formData.payerType;

  // اگر پرداخت‌کننده مشخص نشده، نیازی به محاسبه نیست
  if (!payerType) {
    return allocations;
  }

  // تعیین واحدهای هدف
  let targetUnitsList = [];
  if (formData.targetUnits === 'all') {
    targetUnitsList = buildingUnits;
  } else if (formData.targetUnits === 'occupied') {
    targetUnitsList = buildingUnits.filter(unit => unit.is_occupied);
  } else if (formData.targetUnits === 'empty') {
    targetUnitsList = buildingUnits.filter(unit => !unit.is_occupied);
  } else if (formData.targetUnits === 'custom' && formData.selectedUnits) {
    targetUnitsList = buildingUnits.filter(unit => 
      formData.selectedUnits.includes(unit.id || unit.units_id)
    );
  }

  // برای هر واحد، تعیین کن که شارژ به چه کسی اعمال می‌شود
  targetUnitsList.forEach(unit => {
    const unitId = unit.id || unit.units_id;
    allocations[unitId] = {
      unitId: unitId,
      unitNumber: unit.unit_number || unit.number,
      actualPayer: determineChargeAllocation(unit, payerType),
      unitInfo: {
        owner_type: unit.owner_type,
        is_occupied: unit.is_occupied,
        has_tenant: !!unit.tenant_full_name,
      }
    };
  });

  return allocations;
};

