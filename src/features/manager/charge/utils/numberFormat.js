/**
 * Format number with thousand separators
 */
export const formatNumber = (value) => {
  if (!value || value === '') return '';

  // Allow intermediate states during typing (don't clear if empty after filtering)
  let numericValue = value.replace(/[^\d]/g, '');

  if (numericValue === '') return '';

  // Add thousand separators
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

