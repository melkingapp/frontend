import { useState, useCallback } from 'react';

export const useNumberFormat = (initialValue = '') => {
  const [value, setValue] = useState(initialValue);

  const formatNumber = useCallback((num) => {
    if (!num || num === '') return '';

    // Convert to string and remove all non-numeric characters
    const numericValue = String(num).replace(/[^0-9]/g, '');

    if (numericValue === '') return '';

    // Add commas every 3 digits
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }, []);

  const setFormattedValue = useCallback((newValue) => {
    const formatted = formatNumber(newValue);
    setValue(formatted);
    return formatted;
  }, [formatNumber]);

  const getRawValue = useCallback(() => {
    return value.replace(/,/g, '');
  }, [value]);

  const handleChange = useCallback((inputValue) => {
    const formatted = formatNumber(inputValue);
    setValue(formatted);
  }, [formatNumber]);

  return {
    value,
    setValue: setFormattedValue,
    rawValue: getRawValue(),
    onChange: handleChange,
    formatNumber
  };
};

export default useNumberFormat;
