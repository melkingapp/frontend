import api from './api';

class UnitsApiService {
  // Get unit details by building ID and unit number
  async getUnitByNumber(buildingId, unitNumber) {
    try {
      // First get all units of the building
      const { data } = await api.get(`/buildings/${buildingId}/units/`);
      
      // Find the unit with matching unit_number
      const unit = data.units.find(u => u.unit_number === unitNumber);
      
      if (!unit) {
        throw new Error('واحد یافت نشد');
      }
      
      return {
        success: true,
        unit: unit
      };
    } catch (error) {
      console.error('Error fetching unit details:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'خطا در دریافت اطلاعات واحد'
      };
    }
  }

  // Get unit details by building ID and unit ID
  async getUnitById(buildingId, unitId) {
    try {
      const { data } = await api.get(`/buildings/${buildingId}/units/${unitId}/`);
      return {
        success: true,
        unit: data.unit
      };
    } catch (error) {
      console.error('Error fetching unit details:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'خطا در دریافت اطلاعات واحد'
      };
    }
  }

  // Get all units of a building
  async getBuildingUnits(buildingId) {
    try {
      const { data } = await api.get(`/buildings/${buildingId}/units/`);
      return {
        success: true,
        units: data.units || data // Handle both formats
      };
    } catch (error) {
      console.error('Error fetching building units:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'خطا در دریافت لیست واحدها'
      };
    }
  }

  // Helper function to extract error message from validation errors
  _extractErrorMessage(errorData) {
    if (typeof errorData === 'string') {
      return errorData;
    }
    
    if (typeof errorData === 'object' && errorData !== null) {
      // Handle Django REST Framework validation errors
      // Format: { field_name: ['error message'] } or { field_name: 'error message' }
      const errorMessages = [];
      
      for (const [field, message] of Object.entries(errorData)) {
        if (Array.isArray(message)) {
          errorMessages.push(...message.map(msg => `${this._getFieldLabel(field)}: ${msg}`));
        } else if (typeof message === 'string') {
          errorMessages.push(`${this._getFieldLabel(field)}: ${message}`);
        } else if (typeof message === 'object') {
          // Nested errors
          errorMessages.push(...Object.values(message).flat().map(msg => `${this._getFieldLabel(field)}: ${msg}`));
        }
      }
      
      if (errorMessages.length > 0) {
        return errorMessages.join('\n');
      }
      
      // Fallback: try to get 'error' key
      if (errorData.error) {
        return typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
      }
    }
    
    return 'خطا در ایجاد واحد';
  }

  // Helper to get Persian field labels
  _getFieldLabel(field) {
    const labels = {
      unit_number: 'شماره واحد',
      full_name: 'نام و نام خانوادگی',
      phone_number: 'شماره تماس',
      tenant_full_name: 'نام مستاجر',
      tenant_phone_number: 'شماره تماس مستاجر',
      floor: 'طبقه',
      area: 'متراژ',
      role: 'نقش',
      owner_type: 'نوع مالک',
    };
    return labels[field] || field;
  }

  // Create a new unit
  async createUnit(buildingId, unitData) {
    try {
      const { data } = await api.post(`/buildings/${buildingId}/units/create/`, unitData);
      return {
        success: true,
        unit: data.unit
      };
    } catch (error) {
      console.error('Error creating unit:', error);
      // Extract error message - handle both string and object validation errors
      const errorData = error.data?.error || error.data;
      const errorMessage = this._extractErrorMessage(errorData) || error.message || 'خطا در ایجاد واحد';
      
      throw new Error(errorMessage);
    }
  }

  // Update a unit
  async updateUnit(buildingId, unitId, unitData) {
    try {
      const { data } = await api.put(`/buildings/${buildingId}/units/${unitId}/update/`, unitData);
      return {
        success: true,
        unit: data.unit
      };
    } catch (error) {
      console.error('Error updating unit:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'خطا در به‌روزرسانی واحد'
      };
    }
  }

  // Delete a unit
  async deleteUnit(buildingId, unitId) {
    try {
      await api.delete(`/buildings/${buildingId}/units/${unitId}/delete/`);
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting unit:', error);
      // error.data is set by api.js when throwing errors
      const errorMessage = error.data?.error || error.data?.detail || error.data?.message || error.message || 'خطا در حذف واحد';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Create manager unit for existing buildings
  async createManagerUnit(buildingId) {
    try {
      const { data } = await api.post(`/buildings/${buildingId}/units/create-manager/`);
      return {
        success: true,
        manager_unit: data.manager_unit
      };
    } catch (error) {
      console.error('Error creating manager unit:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'خطا در ایجاد واحد مدیر'
      };
    }
  }
}

const unitsApi = new UnitsApiService();
export default unitsApi;