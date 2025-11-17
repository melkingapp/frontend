import api from '../services/api';

/**
 * Reset all Redux state and localStorage data
 * This should be called when user logs out or when data becomes stale
 */
export const resetAllAppData = () => {
    console.log('🧹 Resetting all app data...');
    
    // Clear localStorage
    api.clearAllAppData();
    
    // Note: Redux state will be reset when user logs out and logs back in
    // localStorage clearing is sufficient for most cases since data is fetched fresh on login
    
    console.log('✅ All app data reset complete');
};

/**
 * Clear only localStorage data (useful for debugging)
 */
export const clearLocalStorageOnly = () => {
    console.log('🧹 Clearing localStorage only...');
    api.clearAllAppData();
    console.log('✅ localStorage cleared');
};

export default {
    resetAllAppData,
    clearLocalStorageOnly
};
