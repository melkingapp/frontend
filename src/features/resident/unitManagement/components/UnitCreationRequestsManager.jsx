import { useState, useEffect } from "react";
import { Building, Home, Phone, Calendar, CheckCircle, XCircle, Clock, Edit, DollarSign, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getApiUrl, getAuthHeaders, API_CONFIG } from "../../../../config/api";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { 
      icon: Clock, 
      color: "bg-yellow-100 text-yellow-800", 
      text: "در انتظار تأیید" 
    },
    approved: { 
      icon: CheckCircle, 
      color: "bg-green-100 text-green-800", 
      text: "تأیید شده" 
    },
    rejected: { 
      icon: XCircle, 
      color: "bg-red-100 text-red-800", 
      text: "رد شده" 
    },
    edited: { 
      icon: Edit, 
      color: "bg-blue-100 text-blue-800", 
      text: "ویرایش شده" 
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon size={12} />
      {config.text}
    </span>
  );
};

export default function UnitCreationRequestsManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  const authToken = localStorage.getItem('access_token');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.UNIT_CREATION_REQUESTS), {
        headers: getAuthHeaders(authToken)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
      toast.error('خطا در دریافت درخواست‌های تأیید واحد');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setActionLoading(true);
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.UNIT_CREATION_REQUEST_APPROVE_REJECT(requestId)), {
        method: 'POST',
        headers: getAuthHeaders(authToken),
        body: JSON.stringify({ status: 'approved' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در تأیید درخواست');
      }

      toast.success('درخواست با موفقیت تأیید شد');
      fetchRequests();
      if (isDetailsOpen) {
        setIsDetailsOpen(false);
      }
    } catch (err) {
      toast.error(err.message || 'خطا در تأیید درخواست');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId, reason = '') => {
    setActionLoading(true);
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.UNIT_CREATION_REQUEST_APPROVE_REJECT(requestId)), {
        method: 'POST',
        headers: getAuthHeaders(authToken),
        body: JSON.stringify({ 
          status: 'rejected',
          rejection_reason: reason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در رد درخواست');
      }

      toast.success('درخواست رد شد');
      fetchRequests();
      if (isDetailsOpen) {
        setIsDetailsOpen(false);
      }
    } catch (err) {
      toast.error(err.message || 'خطا در رد درخواست');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (request) => {
    setEditingRequest(request);
    setEditForm({
      full_name: request.full_name || '',
      phone_number: request.phone_number || '',
      unit_number: request.unit_number || '',
      floor: request.floor || '',
      area: request.area || '',
      resident_count: request.resident_count || 1,
      has_parking: request.has_parking || false,
      parking_count: request.parking_count || 0,
      initial_debt: request.initial_debt || 0,
      initial_credit: request.initial_credit || 0,
      resident_notes: request.resident_notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingRequest) return;

    setActionLoading(true);
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.UNIT_CREATION_REQUEST_UPDATE(editingRequest.request_id)), {
        method: 'PUT',
        headers: getAuthHeaders(authToken),
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در ویرایش درخواست');
      }

      toast.success('درخواست با موفقیت ویرایش شد');
      setIsEditModalOpen(false);
      setEditingRequest(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.message || 'خطا در ویرایش درخواست');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fa-IR').format(amount || 0);
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">درخواست‌های تأیید واحد</h2>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          بروزرسانی
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ درخواستی یافت نشد</h3>
          <p className="text-gray-600">درخواست تأیید واحدی برای شما وجود ندارد.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request.request_id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        واحد {request.unit_number} - {request.building_title || 'نامشخص'}
                      </h3>
                      <p className="text-sm text-gray-600">{request.full_name}</p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Home size={16} />
                      <span>طبقه {request.floor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={16} />
                      <span>{request.phone_number}</span>
                    </div>
                    {(request.initial_debt > 0 || request.initial_credit > 0) && (
                      <>
                        {request.initial_debt > 0 && (
                          <div className="flex items-center gap-2 text-red-600">
                            <DollarSign size={16} />
                            <span>بدهکاری: {formatCurrency(request.initial_debt)} تومان</span>
                          </div>
                        )}
                        {request.initial_credit > 0 && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CreditCard size={16} />
                            <span>بستانکاری: {formatCurrency(request.initial_credit)} تومان</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={14} />
                    <span>{moment(request.created_at).format('jYYYY/jMM/jDD - HH:mm')}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleViewDetails(request)}
                    className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Building size={16} />
                    جزئیات
                  </button>
                  
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleEdit(request)}
                        disabled={actionLoading}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleApprove(request.request_id)}
                        disabled={actionLoading}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors"
                      >
                        <CheckCircle size={16} />
                        تایید
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('دلیل رد درخواست را وارد کنید:');
                          if (reason) {
                            handleReject(request.request_id, reason);
                          }
                        }}
                        disabled={actionLoading}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
                      >
                        <XCircle size={16} />
                        رد
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {isDetailsOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">جزئیات درخواست تأیید واحد</h2>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">نام و نام خانوادگی</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">شماره تماس</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.phone_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">شماره واحد</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.unit_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">طبقه</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.floor}</p>
                  </div>
                  {selectedRequest.area && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">متراژ (متر مربع)</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRequest.area}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">تعداد نفر</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.resident_count}</p>
                  </div>
                </div>

                {(selectedRequest.initial_debt > 0 || selectedRequest.initial_credit > 0) && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">بدهکاری و بستانکاری اولیه</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedRequest.initial_debt > 0 && (
                        <div className="bg-red-50 p-3 rounded-lg">
                          <label className="block text-sm font-medium text-red-700">بدهکاری اولیه</label>
                          <p className="mt-1 text-lg font-bold text-red-900">{formatCurrency(selectedRequest.initial_debt)} تومان</p>
                        </div>
                      )}
                      {selectedRequest.initial_credit > 0 && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <label className="block text-sm font-medium text-green-700">بستانکاری اولیه</label>
                          <p className="mt-1 text-lg font-bold text-green-900">{formatCurrency(selectedRequest.initial_credit)} تومان</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedRequest.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <label className="block text-sm font-medium text-red-700">دلیل رد</label>
                    <p className="mt-1 text-sm text-red-900">{selectedRequest.rejection_reason}</p>
                  </div>
                )}
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => {
                      setIsDetailsOpen(false);
                      handleEdit(selectedRequest);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest.request_id)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    تأیید
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('دلیل رد درخواست را وارد کنید:');
                      if (reason) {
                        handleReject(selectedRequest.request_id, reason);
                      }
                    }}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    رد
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">ویرایش درخواست</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نام و نام خانوادگی</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">شماره تماس</label>
                  <input
                    type="text"
                    value={editForm.phone_number}
                    onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">شماره واحد</label>
                    <input
                      type="text"
                      value={editForm.unit_number}
                      onChange={(e) => setEditForm({ ...editForm, unit_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">طبقه</label>
                    <input
                      type="number"
                      value={editForm.floor}
                      onChange={(e) => setEditForm({ ...editForm, floor: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">متراژ (متر مربع)</label>
                    <input
                      type="number"
                      value={editForm.area}
                      onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تعداد نفر</label>
                    <input
                      type="number"
                      value={editForm.resident_count}
                      onChange={(e) => setEditForm({ ...editForm, resident_count: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">بدهکاری و بستانکاری اولیه</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">بدهکاری اولیه (تومان)</label>
                      <input
                        type="number"
                        value={editForm.initial_debt}
                        onChange={(e) => {
                          const debt = parseFloat(e.target.value) || 0;
                          setEditForm({ 
                            ...editForm, 
                            initial_debt: debt,
                            initial_credit: debt > 0 ? 0 : editForm.initial_credit
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">بستانکاری اولیه (تومان)</label>
                      <input
                        type="number"
                        value={editForm.initial_credit}
                        onChange={(e) => {
                          const credit = parseFloat(e.target.value) || 0;
                          setEditForm({ 
                            ...editForm, 
                            initial_credit: credit,
                            initial_debt: credit > 0 ? 0 : editForm.initial_debt
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingRequest(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  لغو
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  ذخیره
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

