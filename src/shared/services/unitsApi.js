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
      // Extract error message from error.data (from api.js) or error.message
      const errorMessage = error.data?.error || error.message || 'خطا در ایجاد واحد';
      return {
        success: false,
        error: errorMessage
      };
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