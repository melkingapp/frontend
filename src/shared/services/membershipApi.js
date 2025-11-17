import api from './api';

class MembershipApiService {
  /**
   * ارسال درخواست عضویت
   */
  async createMembershipRequest(requestData) {
    const { data } = await api.post('/membership/create/', requestData);
    return data;
  }

  /**
   * دریافت لیست درخواست‌های عضویت
   */
  async getMembershipRequests(params = {}) {
    const { data } = await api.get('/membership/list/', { params });
    return data;
  }

  /**
   * دریافت درخواست‌های عضویت برای مالک
   */
  async getOwnerMembershipRequests(status = null) {
    const params = status ? { status } : {};
    const { data } = await api.get('/membership/owner/requests/', { params });
    return data;
  }

  /**
   * دریافت درخواست‌های منتظر تایید مالک
   */
  async getPendingOwnerApprovalRequests() {
    const { data } = await api.get('/membership/owner/pending-approval/');
    return data;
  }

  /**
   * دریافت درخواست‌های عضویت منتظر تایید مدیر
   */
  async getManagerPendingRequests() {
    const { data } = await api.get('/membership/manager/pending/');
    return data;
  }

  /**
   * دریافت جزئیات درخواست عضویت
   */
  async getMembershipRequest(requestId) {
    const { data } = await api.get(`/membership/${requestId}/`);
    return data;
  }

  /**
   * تایید درخواست عضویت توسط مالک
   */
  async approveMembershipRequestByOwner(requestId) {
    const { data } = await api.post(`/membership/${requestId}/approve-by-owner/`);
    return data;
  }

  /**
   * تایید نهایی درخواست عضویت توسط مدیر
   */
  async approveMembershipRequestByManager(requestId) {
    const { data } = await api.post(`/membership/${requestId}/approve-by-manager/`);
    return data;
  }

  /**
   * رد درخواست عضویت
   */
  async rejectMembershipRequest(requestId, rejectionReason) {
    const { data } = await api.post(`/membership/${requestId}/reject/`, {
      rejection_reason: rejectionReason
    });
    return data;
  }

  /**
   * Debug endpoint برای دریافت تمام اطلاعات
   */
  async debugAllRequests() {
    const { data } = await api.get('/membership/debug/all/');
    return data;
  }

  /**
   * دریافت اطلاعات واحد بر اساس شماره تماس
   */
  async getUnitByPhone(phoneNumber) {
    // NOTE: api.get doesn't serialize params automatically; append query manually
    const qs = `?phone_number=${encodeURIComponent(phoneNumber || '')}`;
    const { data } = await api.get(`/buildings/units/by-phone/${qs}`);
    return data;
  }
}

const membershipApi = new MembershipApiService();
export default membershipApi;
