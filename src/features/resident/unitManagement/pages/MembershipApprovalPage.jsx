import React from 'react';
import OwnerMembershipRequestsManager from '../components/OwnerMembershipRequestsManager';

const MembershipApprovalPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تایید درخواست‌های عضویت ساکنان</h1>
            <p className="text-gray-600 mt-1">
              درخواست‌های عضویتی که توسط شما تایید شده‌اند
            </p>
          </div>
        </div>
      </div>

      <OwnerMembershipRequestsManager />
    </div>
  );
};

export default MembershipApprovalPage;
