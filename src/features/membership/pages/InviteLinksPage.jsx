import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { fetchInviteLinks, createInviteLink, selectInviteLinks, selectInviteLinksLoading, selectCreateInviteLinkLoading } from '../membershipSlice';
import { fetchApprovedBuildings } from '../../resident/building/residentBuildingSlice';
import { Plus, Link, Copy, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function InviteLinksPage() {
  const dispatch = useDispatch();
  const inviteLinks = useSelector(selectInviteLinks);
  const loading = useSelector(selectInviteLinksLoading);
  const createLoading = useSelector(selectCreateInviteLinkLoading);
  const approvedBuildings = useSelector(state => state.residentBuilding.approvedBuildings);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    building: '',
    unit_number: '',
    role: 'resident',
    expires_at: ''
  });

  useEffect(() => {
    dispatch(fetchInviteLinks());
    dispatch(fetchApprovedBuildings());
  }, [dispatch]);

  const handleCreateInviteLink = async (e) => {
    e.preventDefault();

    try {
      await dispatch(createInviteLink(formData)).unwrap();
      toast.success('لینک دعوت با موفقیت ایجاد شد');
      setShowCreateForm(false);
      setFormData({
        building: '',
        unit_number: '',
        role: 'resident',
        expires_at: ''
      });
      dispatch(fetchInviteLinks());
    } catch (error) {
      toast.error(error || 'خطا در ایجاد لینک دعوت');
    }
  };

  const copyInviteLink = (token) => {
    const link = `${window.location.origin}/join/invite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('لینک دعوت کپی شد');
  };

  const getRoleText = (role) => {
    return role === 'owner' ? 'مالک' : 'ساکن';
  };

  const getStatusIcon = (inviteLink) => {
    if (inviteLink.is_used) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (inviteLink.is_expired) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    } else {
      return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusText = (inviteLink) => {
    if (inviteLink.is_used) {
      return 'استفاده شده';
    } else if (inviteLink.is_expired) {
      return 'منقضی شده';
    } else {
      return 'فعال';
    }
  };

  const getStatusColor = (inviteLink) => {
    if (inviteLink.is_used) {
      return 'bg-green-100 text-green-800';
    } else if (inviteLink.is_expired) {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Link className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">لینک‌های دعوت</h1>
            <p className="text-gray-600">مدیریت لینک‌های دعوت برای عضویت در ساختمان</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          لینک جدید
        </button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">ایجاد لینک دعوت جدید</h3>
            <form onSubmit={handleCreateInviteLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ساختمان</label>
                <select
                  value={formData.building}
                  onChange={(e) => setFormData({...formData, building: e.target.value})}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">انتخاب ساختمان</option>
                  {approvedBuildings.map(building => (
                    <option key={building.building_id} value={building.building_id}>
                      {building.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">شماره واحد</label>
                <input
                  type="text"
                  value={formData.unit_number}
                  onChange={(e) => setFormData({...formData, unit_number: e.target.value})}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: 101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نقش</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="resident">ساکن</option>
                  <option value="owner">مالک</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ انقضا</label>
                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createLoading ? 'در حال ایجاد...' : 'ایجاد لینک'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Links List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {inviteLinks.length === 0 ? (
            <div className="text-center py-12">
              <Link className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ لینکی یافت نشد</h3>
              <p className="text-gray-600">برای ایجاد لینک دعوت جدید، روی دکمه "لینک جدید" کلیک کنید</p>
            </div>
          ) : (
            inviteLinks.map(link => (
              <div key={link.link_id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(link)}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        لینک دعوت {getRoleText(link.role)} - واحد {link.unit_number}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {link.building_title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(link)}`}>
                      {getStatusText(link)}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => copyInviteLink(link.token)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="کپی لینک دعوت"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(`/join/invite/${link.token}`, '_blank')}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="پیش‌نمایش لینک"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <div>
                    ایجاد شده در {new Date(link.created_at).toLocaleDateString('fa-IR')}
                    {link.is_used && link.used_by_name && (
                      <span className="mr-4">
                        استفاده شده توسط {link.used_by_name}
                      </span>
                    )}
                  </div>
                  <div>
                    انقضا: {new Date(link.expires_at).toLocaleDateString('fa-IR')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
