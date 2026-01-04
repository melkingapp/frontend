import moment from "moment-jalaali";

/**
 * Convert date string to Persian Jalali format
 * Backend sends datetime in Tehran timezone, so we just parse it normally
 * @param {string} dateString - Date string in various formats (from backend in Tehran timezone)
 * @returns {string} - Formatted Persian date or fallback
 */
export const formatJalaliDate = (dateString) => {
  if (!dateString) return "—";
  try {
    // Backend sends datetime in Tehran timezone, so parse normally
    const date = moment(dateString);
    if (date.isValid()) {
      return date.format("jYYYY/jMM/jDD");
    }
    // If not valid, try Persian format
    const persianDate = moment(dateString, "jYYYY/jMM/jDD");
    if (persianDate.isValid()) {
      return persianDate.format("jYYYY/jMM/jDD");
    }
    return dateString;
  } catch {
    return dateString;
  }
};

/**
 * Format date with time for detailed views
 * Backend sends datetime in Tehran timezone, so we just parse it normally
 * @param {string} dateString - Date string (from backend in Tehran timezone)
 * @returns {string} - Formatted Persian date with time
 */
export const formatJalaliDateTime = (dateString) => {
  if (!dateString) return "—";
  try {
    // Backend sends datetime in Tehran timezone, so parse normally
    const date = moment(dateString);
    if (date.isValid()) {
      return date.format("jYYYY/jMM/jDD - HH:mm");
    }
    return dateString;
  } catch {
    return dateString;
  }
};

/**
 * Get relative time in Persian
 * @param {string} dateString - Date string
 * @returns {string} - Relative time in Persian
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return "—";
  try {
    const date = moment(dateString);
    if (date.isValid()) {
      return date.fromNow();
    }
    return dateString;
  } catch {
    return dateString;
  }
};
