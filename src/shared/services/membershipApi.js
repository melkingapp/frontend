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
   * دریافت درخواست‌های عضویت پیشنهادی برای رزیدنت
   */
  async getSuggestedRequests() {
    const { data } = await api.get('/membership/suggested-requests/');
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
   * رد درخواست suggested عضویت توسط کاربر صاحب درخواست
   */
  async rejectSuggestedMembershipRequest(requestId, rejectionReason = '') {
    const { data } = await api.post(`/membership/${requestId}/reject-suggested/`, {
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

  /**
   * ایجاد دعوت‌نامه خانواده (US6)
   */
  async createFamilyInvitation(data) {
    const { data: response } = await api.post('/membership/family/invite/', data);
    return response;
  }

  /**
   * دریافت لیست دعوت‌نامه‌های ارسالی (US6)
   */
  async listFamilyInvitations() {
    const { data } = await api.get('/membership/family/invitations/');
    return data;
  }

  /**
   * پذیرش دعوت‌نامه خانواده (US6)
   */
  async acceptFamilyInvitation(code) {
    const { data } = await api.post(`/membership/family/accept/${code}/`);
    return data;
  }

  /**
   * گزارش تعارض واحد (US7)
   */
  async reportUnitConflict(data) {
    const { data: response } = await api.post('/membership/conflict/report/', data);
    return response;
  }

  /**
   * دریافت لیست گزارش‌های تعارض (US7)
   */
  async listConflictReports() {
    const { data } = await api.get('/membership/conflict/list/');
    return data;
  }

  /**
   * حل گزارش تعارض (US7)
   */
  async resolveConflict(reportId, data) {
    const { data: response } = await api.post(`/membership/conflict/${reportId}/resolve/`, data);
    return response;
  }

  /**
   * انصراف از درخواست عضویت (US9)
   */
  async withdrawMembershipRequest(requestId) {
    const { data } = await api.post(`/membership/${requestId}/withdraw/`);
    return data;
  }

  /**
   * وارد کردن گروهی واحدها (US10)
   */
  async bulkImportUnits(buildingId, data) {
    const { data: response } = await api.post(`/buildings/${buildingId}/units/bulk-import/`, data);
    return response;
  }

  /**
   * ایجاد لینک دعوت (US11)
   */
  async createInviteLink(data) {
    const { data: response } = await api.post('/membership/invite-link/create/', data);
    return response;
  }

  /**
   * دریافت لیست لینک‌های دعوت (US11)
   */
  async listInviteLinks() {
    const { data } = await api.get('/membership/invite-link/list/');
    return data;
  }

  /**
   * اعتبارسنجی لینک دعوت (US11)
   */
  async validateInviteLink(token) {
    const { data } = await api.get(`/membership/invite-link/validate/${token}/`);
    return data;
  }

  /**
   * استفاده از لینک دعوت (US11)
   */
  async useInviteLink(token) {
    const { data } = await api.post(`/membership/invite-link/use/${token}/`);
    return data;
  }

  /**
   * ثبت کاربر با وضعیت suggested (PRD)
   */
  async registerSuggestedUser(data) {
    const { data: response } = await api.post('/membership/suggest-user/', data);
    return response;
  }

  /**
   * عضویت با شماره تلفن مدیر (PRD)
   */
  async joinByManagerPhone(data) {
    const { data: response } = await api.post('/membership/join-by-manager-phone/', data);
    return response;
  }

  /**
   * انتقال مدیریت ساختمان (PRD)
   */
  async transferBuildingManagement(buildingId, data) {
    const { data: response } = await api.post(`/buildings/${buildingId}/transfer-management/`, data);
    return response;
  }

}

const membershipApi = new MembershipApiService();
export default membershipApi;
