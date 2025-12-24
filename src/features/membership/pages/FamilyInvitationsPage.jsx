import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { fetchFamilyInvitations, createFamilyInvitation, selectFamilyInvitations, selectFamilyInvitationsLoading, selectCreateFamilyInvitationLoading } from '../membershipSlice';
import { fetchApprovedBuildings } from '../../resident/building/residentBuildingSlice';
import { Plus, Users, Clock, CheckCircle, XCircle, Copy, Share2 } from 'lucide-react';

export default function FamilyInvitationsPage() {
  const dispatch = useDispatch();
  const familyInvitations = useSelector(selectFamilyInvitations);
  const loading = useSelector(selectFamilyInvitationsLoading);
  const createLoading = useSelector(selectCreateFamilyInvitationLoading);
  const approvedBuildings = useSelector(state => state.residentBuilding.approvedBuildings);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    building: '',
    unit_number: '',
    invited_phone: '',
    expires_at: ''
  });

  useEffect(() => {
    dispatch(fetchFamilyInvitations());
    dispatch(fetchApprovedBuildings());
  }, [dispatch]);

  const handleCreateInvitation = async (e) => {
    e.preventDefault();

    try {
      await dispatch(createFamilyInvitation(formData)).unwrap();
      toast.success('دعوت‌نامه با موفقیت ارسال شد');
      setShowCreateForm(false);
      setFormData({
        building: '',
        unit_number: '',
        invited_phone: '',
        expires_at: ''
      });
      dispatch(fetchFamilyInvitations());
    } catch (error) {
      toast.error(error || 'خطا در ایجاد دعوت‌نامه');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'در انتظار';
      case 'accepted':
        return 'پذیرفته شده';
      case 'expired':
        return 'منقضی شده';
      default:
        return status;
    }
  };

  const copyInvitationLink = (code) => {
    const link = `${window.location.origin}/join/family/${code}`;
    navigator.clipboard.writeText(link);
    toast.success('لینک دعوت‌نامه کپی شد');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">دعوت‌نامه‌های خانواده</h1>
            <p className="text-gray-600">مدیریت دعوت‌نامه‌های اعضای خانواده و هم‌خانه‌ها</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          دعوت‌نامه جدید
        </button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">ایجاد دعوت‌نامه جدید</h3>
            <form onSubmit={handleCreateInvitation} className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">شماره تلفن دعوت‌شده</label>
                <input
                  type="tel"
                  value={formData.invited_phone}
                  onChange={(e) => setFormData({...formData, invited_phone: e.target.value})}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="09123456789"
                />
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
                  {createLoading ? 'در حال ارسال...' : 'ارسال دعوت‌نامه'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invitations List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {familyInvitations.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ دعوت‌نامه‌ای یافت نشد</h3>
              <p className="text-gray-600">برای دعوت اعضای خانواده، روی دکمه "دعوت‌نامه جدید" کلیک کنید</p>
            </div>
          ) : (
            familyInvitations.map(invitation => (
              <div key={invitation.invitation_id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(invitation.status)}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        دعوت‌نامه برای {invitation.invited_phone}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {invitation.building_title} - واحد {invitation.unit_number}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      invitation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getStatusText(invitation.status)}
                    </span>

                    {invitation.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyInvitationLink(invitation.invitation_code)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="کپی لینک دعوت‌نامه"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const link = `${window.location.origin}/join/family/${invitation.invitation_code}`;
                            if (navigator.share) {
                              navigator.share({
                                title: 'دعوت‌نامه خانواده',
                                text: 'برای پیوستن به واحد من کلیک کنید',
                                url: link
                              });
                            }
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="اشتراک‌گذاری"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  ایجاد شده در {new Date(invitation.created_at).toLocaleDateString('fa-IR')}
                  {invitation.invited_user_name && (
                    <span className="mr-4">
                      پذیرفته شده توسط {invitation.invited_user_name}
                    </span>
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
