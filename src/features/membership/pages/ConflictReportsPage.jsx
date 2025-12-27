import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { fetchConflictReports, resolveConflict, selectConflictReports, selectConflictReportsLoading, selectResolveConflictLoading } from '../membershipSlice';
import { AlertTriangle, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';

export default function ConflictReportsPage() {
  const dispatch = useDispatch();
  const reports = useSelector(selectConflictReports);
  const loading = useSelector(selectConflictReportsLoading);
  const resolveLoading = useSelector(selectResolveConflictLoading);

  const [selectedReport, setSelectedReport] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveData, setResolveData] = useState({
    action: 'resolve',
    resolution_note: ''
  });
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchConflictReports());
  }, [dispatch]);

  const handleResolveReport = async () => {
    if (!selectedReport) return;

    try {
      await dispatch(resolveConflict({
        reportId: selectedReport.report_id,
        data: resolveData
      })).unwrap();

      toast.success(resolveData.action === 'resolve' ? 'گزارش حل شد' : 'گزارش رد شد');
      setShowResolveModal(false);
      setSelectedReport(null);
      setResolveData({ action: 'resolve', resolution_note: '' });
      dispatch(fetchConflictReports());
    } catch (error) {
      toast.error(error || 'خطا در حل گزارش');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'در انتظار بررسی';
      case 'resolved':
        return 'حل شده';
      case 'rejected':
        return 'رد شده';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReports = reports.filter(report => {
    if (statusFilter === 'all') return true;
    return report.status === statusFilter;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">گزارش‌های تعارض</h1>
            <p className="text-gray-600">مدیریت گزارش‌های تعارض واحدها</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">فیلتر وضعیت:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">همه</option>
          <option value="pending">در انتظار بررسی</option>
          <option value="resolved">حل شده</option>
          <option value="rejected">رد شده</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className="font-medium text-gray-900">در انتظار بررسی</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600 mt-2">
            {reports.filter(r => r.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium text-gray-900">حل شده</span>
          </div>
          <div className="text-2xl font-bold text-green-600 mt-2">
            {reports.filter(r => r.status === 'resolved').length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="font-medium text-gray-900">رد شده</span>
          </div>
          <div className="text-2xl font-bold text-red-600 mt-2">
            {reports.filter(r => r.status === 'rejected').length}
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">حل گزارش تعارض</h3>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>گزارش‌دهنده:</strong> {selectedReport.reported_by_name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>واحد:</strong> {selectedReport.unit_number}
              </p>
              <p className="text-sm text-gray-600">
                <strong>دلیل:</strong> {selectedReport.reason}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اقدام</label>
                <select
                  value={resolveData.action}
                  onChange={(e) => setResolveData({...resolveData, action: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="resolve">حل گزارش</option>
                  <option value="reject">رد گزارش</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">یادداشت</label>
                <textarea
                  value={resolveData.resolution_note}
                  onChange={(e) => setResolveData({...resolveData, resolution_note: e.target.value})}
                  placeholder="یادداشت حل یا رد گزارش..."
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                onClick={handleResolveReport}
                disabled={resolveLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {resolveLoading ? 'در حال پردازش...' : 'تایید'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {statusFilter === 'all' ? 'هیچ گزارشی یافت نشد' : `هیچ گزارش ${getStatusText(statusFilter)} وجود ندارد`}
              </h3>
              <p className="text-gray-600">گزارش‌های تعارض واحدها در اینجا نمایش داده می‌شود</p>
            </div>
          ) : (
            filteredReports.map(report => (
              <div key={report.report_id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(report.status)}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        گزارش تعارض واحد {report.unit_number}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {report.building_title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                      {getStatusText(report.status)}
                    </span>

                    {report.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowResolveModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        بررسی و حل
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-sm text-gray-600">
                    <strong>گزارش‌دهنده:</strong> {report.reported_by_name}
                  </div>
                  {report.current_resident_name && (
                    <div className="text-sm text-gray-600">
                      <strong>ساکن فعلی:</strong> {report.current_resident_name}
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    <strong>دلیل گزارش:</strong> {report.reason}
                  </div>
                  <div className="text-sm text-gray-500">
                    تاریخ گزارش: {new Date(report.created_at).toLocaleDateString('fa-IR')}
                  </div>
                  {report.resolution_note && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>یادداشت حل:</strong> {report.resolution_note}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
