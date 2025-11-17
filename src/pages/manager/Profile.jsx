import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { User, Phone, Building, Calendar, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import moment from "moment-jalaali";
import { fetchProfile, updateProfile, selectProfile, selectProfileLoading, selectUpdateLoading, selectUpdateError } from "../../features/profile/profileSlice";

moment.loadPersian({ dialect: "persian-modern" });

export default function ManagerProfile() {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { data: buildings } = useSelector(state => state.building);
    const profile = useSelector(selectProfile);
    const profileLoading = useSelector(selectProfileLoading);
    const updateLoading = useSelector(selectUpdateLoading);
    const updateError = useSelector(selectUpdateError);
    
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        phone_number: '',
        first_name: '',
        last_name: '',
        date_joined: '',
    });

    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    useEffect(() => {
        if (profile) {
            setProfileData({
                phone_number: profile.phone_number || '',
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                date_joined: profile.date_joined || '',
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
                phone_number: profile.phone_number || '',
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                date_joined: profile.date_joined || '',
            });
        }
        setIsEditing(false);
    };

    const userBuildings = buildings?.filter(b => b.manager?.phone === user?.phone) || [];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                                <User size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">پروفایل مدیر</h1>
                                <p className="text-gray-600">مدیریت اطلاعات شخصی و ساختمان‌ها</p>
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
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Save size={16} />
                                        ذخیره
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">نام</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profileData.first_name || ''}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                                    value={profileData.last_name || ''}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                                    <User size={16} className="text-gray-500" />
                                    <span className="text-gray-900">{profileData.last_name || '—'}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">شماره تماس</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={profileData.phone_number || ''}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, phone_number: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                                    <Phone size={16} className="text-gray-500" />
                                    <span className="text-gray-900">{profileData.phone_number || '—'}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ عضویت</label>
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                                <Calendar size={16} className="text-gray-500" />
                                <span className="text-gray-900">
                                    {profileData?.date_joined ? moment(profileData.date_joined).format('jYYYY/jMM/jDD') : '—'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buildings */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">ساختمان‌های تحت مدیریت</h2>
                    
                    {userBuildings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {userBuildings.map((building) => (
                                <div key={building.building_id || building.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Building size={18} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{building.title}</h3>
                                            <p className="text-sm text-gray-600">کد: {building.building_code}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p>نوع کاربری: {building.usage_type}</p>
                                        <p>تعداد واحدها: {building.unit_count}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Building size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">هنوز ساختمانی تحت مدیریت شما نیست</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
