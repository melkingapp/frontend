import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Calendar, Clock, Power, PowerOff, Trash2, Play, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getChargeSchedules, toggleChargeSchedule, deleteChargeSchedule, executeChargeSchedule } from "../../../../shared/services/billingService";
import moment from "moment-jalaali";

// Load Persian locale
moment.loadPersian({ dialect: "persian-modern" });

const ChargeSchedulesList = forwardRef(function ChargeSchedulesList({ buildingId }, ref) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (buildingId) {
      fetchSchedules();
    }
  }, [buildingId]);

  const fetchSchedules = async () => {
    if (!buildingId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await getChargeSchedules(buildingId, null);
      setSchedules(response.schedules || []);
    } catch (err) {
      console.error("Error fetching schedules:", err);
      setError("خطا در دریافت لیست شارژهای خودکار");
      toast.error("خطا در دریافت لیست شارژهای خودکار");
    } finally {
      setLoading(false);
    }
  };

  // Expose fetchSchedules to parent component via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchSchedules
  }));

  const handleToggle = async (scheduleId, currentStatus) => {
    setActionLoading({ ...actionLoading, [scheduleId]: 'toggle' });
    try {
      await toggleChargeSchedule(scheduleId);
      toast.success(`شارژ خودکار ${currentStatus ? 'غیرفعال' : 'فعال'} شد`);
      fetchSchedules();
    } catch (err) {
      console.error("Error toggling schedule:", err);
      toast.error("خطا در تغییر وضعیت شارژ خودکار");
    } finally {
      setActionLoading({ ...actionLoading, [scheduleId]: null });
    }
  };

  const handleDelete = async (scheduleId, title) => {
    if (!window.confirm(`آیا از حذف شارژ خودکار "${title}" اطمینان دارید؟`)) {
      return;
    }

    setActionLoading({ ...actionLoading, [scheduleId]: 'delete' });
    try {
      await deleteChargeSchedule(scheduleId);
      toast.success("شارژ خودکار با موفقیت حذف شد");
      fetchSchedules();
    } catch (err) {
      console.error("Error deleting schedule:", err);
      toast.error("خطا در حذف شارژ خودکار");
    } finally {
      setActionLoading({ ...actionLoading, [scheduleId]: null });
    }
  };

  const handleExecute = async (scheduleId) => {
    setActionLoading({ ...actionLoading, [scheduleId]: 'execute' });
    try {
      await executeChargeSchedule(scheduleId);
      toast.success("شارژ با موفقیت اجرا شد");
      fetchSchedules();
    } catch (err) {
      console.error("Error executing schedule:", err);
      toast.error("خطا در اجرای شارژ");
    } finally {
      setActionLoading({ ...actionLoading, [scheduleId]: null });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    try {
      // Parse as Gregorian date (YYYY-MM-DD) and convert to Jalaali
      const date = moment(dateString, 'YYYY-MM-DD');
      if (date.isValid()) {
        return date.format("jYYYY/jMM/jDD");
      }
      // If not valid, try parsing as Jalaali
      const jalaaliDate = moment(dateString, 'jYYYY/jMM/jDD');
      if (jalaaliDate.isValid()) {
        return jalaaliDate.format("jYYYY/jMM/jDD");
      }
      return dateString;
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return dateString;
    }
  };

  const getStatusBadge = (schedule) => {
    if (!schedule.is_active) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <PowerOff className="w-3 h-3 ml-1" />
          غیرفعال
        </span>
      );
    }

    const today = moment();
    const endDate = schedule.end_date ? moment(schedule.end_date) : null;
    
    if (endDate && today.isAfter(endDate)) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 ml-1" />
          منقضی شده
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Power className="w-3 h-3 ml-1" />
        فعال
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="mr-2 text-gray-600">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-center py-8 text-red-600">
          <AlertCircle className="w-5 h-5 ml-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-melkingDarkBlue" />
            شارژهای خودکار
          </h2>
          <button
            onClick={fetchSchedules}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="بروزرسانی"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>هیچ شارژ خودکاری ثبت نشده است</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-melkingDarkBlue" />
          شارژهای خودکار ({schedules.length})
        </h2>
        <button
          onClick={fetchSchedules}
          disabled={loading}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="بروزرسانی"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {schedules.map((schedule) => {
          const isLoading = actionLoading[schedule.schedule_id];
          const announcement = schedule.announcement || {};

          return (
            <div
              key={schedule.schedule_id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {announcement.title || "شارژ بدون عنوان"}
                    </h3>
                    {getStatusBadge(schedule)}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>روز ماه: {schedule.day_of_month}</span>
                    </div>
                    {schedule.end_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>پایان: {formatDate(schedule.end_date)}</span>
                      </div>
                    )}
                    {announcement.total_calculated_amount && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">مبلغ: {new Intl.NumberFormat('fa-IR').format(announcement.total_calculated_amount)} تومان</span>
                      </div>
                    )}
                    {schedule.last_executed && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs">آخرین اجرا: {formatDate(schedule.last_executed)}</span>
                      </div>
                    )}
                    {schedule.next_execution && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs">اجرای بعدی: {formatDate(schedule.next_execution)}</span>
                      </div>
                    )}
                  </div>

                  {announcement.charge_type && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                        نوع: {announcement.charge_type === 'fixed' ? 'ثابت' : 
                              announcement.charge_type === 'formula' ? 'فرمولی' : 
                              announcement.charge_type === 'custom' ? 'دلخواه' : announcement.charge_type}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mr-4">
                  {schedule.is_active && (
                    <button
                      onClick={() => handleExecute(schedule.schedule_id)}
                      disabled={isLoading === 'execute'}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      title="اجرای دستی"
                    >
                      {isLoading === 'execute' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleToggle(schedule.schedule_id, schedule.is_active)}
                    disabled={isLoading === 'toggle'}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                      schedule.is_active
                        ? 'text-orange-600 hover:bg-orange-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={schedule.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                  >
                    {isLoading === 'toggle' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : schedule.is_active ? (
                      <PowerOff className="w-4 h-4" />
                    ) : (
                      <Power className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(schedule.schedule_id, announcement.title)}
                    disabled={isLoading === 'delete'}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="حذف"
                  >
                    {isLoading === 'delete' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default ChargeSchedulesList;


