import { useState } from "react";
import { ChevronLeft, Filter, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import OwnerMembershipRequestsManager from "../components/OwnerMembershipRequestsManager";

export default function OwnerMembershipRequestsPage() {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300
                   text-gray-700 bg-gradient-to-r from-gray-50 to-white shadow-sm
                   hover:shadow-md hover:from-white hover:to-gray-50
                   active:scale-95 transition-all duration-200 font-medium"
          >
            <ChevronLeft size={20} className="text-gray-600" />
            بازگشت
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              مدیریت درخواست‌های عضویت
            </h1>
            <p className="text-gray-600">
              بررسی و تایید درخواست‌های عضویت ساکنان در ساختمان‌های شما
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">فیلترها</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">وضعیت</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">همه</option>
              <option value="pending">در انتظار تایید</option>
              <option value="owner_approved">تایید شده توسط من</option>
              <option value="manager_approved">تایید شده توسط مدیر</option>
              <option value="rejected">رد شده</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">جستجو</label>
            <div className="relative">
              <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو در نام، ساختمان یا شماره واحد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <OwnerMembershipRequestsManager />
    </div>
  );
}
