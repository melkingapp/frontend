import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { User, Mail, Phone, Building, Calendar, Edit, Save, X, Home } from "lucide-react";
import { toast } from "sonner";
import moment from "moment-jalaali";
import { fetchProfile, updateProfile, selectProfile, selectProfileLoading, selectUpdateLoading, selectUpdateError } from "../../features/profile/profileSlice";

moment.loadPersian({ dialect: "persian-modern" });

export default function ResidentProfile() {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { requests: membershipRequests } = useSelector(state => state.membership);
    const profile = useSelector(selectProfile);
    const profileLoading = useSelector(selectProfileLoading);
    const updateLoading = useSelector(selectUpdateLoading);
    const updateError = useSelector(selectUpdateError);
    
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        phone_number: '',
        first_name: '',
        last_name: '',
    });

    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    useEffect(() => {
        if (profile) {
            setProfileData({
                username: profile.username || '',
                email: profile.email || '',
                phone_number: profile.phone_number || '',
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
            });
        }
    }, [profile]);

    const handleSave = async () => {
        try {
            await dispatch(updateProfile(profileData)).unwrap();
            toast.success('پروفایل با موفقیت به‌روزرسانی شد');
            setIsEditing(false);
        } catch (error) {
            toast.error('خطا در به‌روزرسانی پروفایل: ' + error);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setProfileData({
                username: profile.username || '',
                email: profile.email || '',
                phone_number: profile.phone_number || '',
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
            });
        }
        setIsEditing(false);
    };

    // Get approved memberships
    const approvedMemberships = membershipRequests?.filter(req => req.status === 'approved') || [];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                                <User size={24} className="text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">پروفایل ساکن</h1>
                                <p className="text-gray-600">مدیریت اطلاعات شخصی و عضویت‌ها</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <X size={16} />
                                        انصراف
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Save size={16} />
                                        ذخیره
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Edit size={16} />
                                    ویرایش
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">اطلاعات شخصی</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">نام کاربری</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profileData.username}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                />
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                                    <User size={16} className="text-gray-500" />
                                    <span className="text-gray-900">{profileData.username || '—'}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ایمیل</label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                />
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                                    <Mail size={16} className="text-gray-500" />
                                    <span className="text-gray-900">{profileData.email || '—'}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">شماره تماس</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={profileData.phone_number}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, phone_number: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                />
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                                    <Phone size={16} className="text-gray-500" />
                                    <span className="text-gray-900">{profileData.phone_number || '—'}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">نام</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profileData.first_name}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                />
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                                    <User size={16} className="text-gray-500" />
                                    <span className="text-gray-900">{profileData.first_name || '—'}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">نام خانوادگی</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profileData.last_name}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                />
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                                    <User size={16} className="text-gray-500" />
                                    <span className="text-gray-900">{profileData.last_name || '—'}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ عضویت</label>
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                                <Calendar size={16} className="text-gray-500" />
                                <span className="text-gray-900">
                                    {user?.date_joined ? moment(user.date_joined).format('jYYYY/jMM/jDD') : '—'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Memberships */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">عضویت‌های فعال</h2>
                    
                    {approvedMemberships.length > 0 ? (
                        <div className="space-y-4">
                            {approvedMemberships.map((membership) => (
                                <div key={membership.request_id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Building size={18} className="text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{membership.building_title}</h3>
                                            <p className="text-sm text-gray-600">کد: {membership.building_code}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Home size={16} className="text-gray-500" />
                                                <span className="text-sm font-medium">واحد {membership.unit_number}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">طبقه {membership.floor}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                        <div>
                                            <span className="font-medium">نقش:</span> {membership.role === 'resident' ? 'ساکن' : 'مالک'}
                                        </div>
                                        <div>
                                            <span className="font-medium">متراژ:</span> {membership.area} متر مربع
                                        </div>
                                        <div>
                                            <span className="font-medium">تعداد نفر:</span> {membership.resident_count}
                                        </div>
                                        <div>
                                            <span className="font-medium">پارکینگ:</span> {membership.has_parking ? `${membership.parking_count} عدد` : 'ندارد'}
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-xs text-gray-500">
                                            تایید شده در: {moment(membership.approved_at).format('jYYYY/jMM/jDD - HH:mm')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Building size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">هنوز در هیچ ساختمانی عضو نیستید</p>
                            <p className="text-sm text-gray-500 mt-2">برای عضویت در ساختمان، درخواست عضویت ارسال کنید</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
