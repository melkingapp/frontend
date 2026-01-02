import moment from "moment-jalaali";
import { Building, Clock, CheckCircle, XCircle, Eye, Calendar, User, Home, Car } from "lucide-react";
import StatusBadge from "./StatusBadge";

moment.loadPersian({ dialect: "persian-modern" });

const RoleBadge = ({ role }) => {
  const roleConfig = {
    resident: { color: "bg-blue-100 text-blue-800", text: "ساکن" },
    owner: { color: "bg-purple-100 text-purple-800", text: "مالک" },
  };
  const config = roleConfig[role] || roleConfig.resident;
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};

const CardRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-2">
    {icon}
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  </div>
);

const MembershipRequestCard = ({ request, onApprove, onReject, onViewDetails, showActions = false }) => {
  
  const handleApprove = (e) => {
    e.stopPropagation();
    if (onApprove) onApprove(request);
  };

  const handleReject = (e) => {
    e.stopPropagation();
    if (onReject) {
        const reason = window.prompt('دلیل رد درخواست را وارد کنید:');
        if (reason && reason.trim()) {
            onReject(request.request_id, reason.trim());
        }
    }
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewDetails(request)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{request.full_name}</h3>
            <p className="text-sm text-gray-600">{request.building_title}</p>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4 border-t pt-4">
        <CardRow icon={<Home size={16} className="text-gray-500" />} label="واحد" value={request.unit_number} />
        <CardRow icon={<Building size={16} className="text-gray-500" />} label="طبقه" value={request.floor} />
        <CardRow icon={<User size={16} className="text-gray-500" />} label="نقش" value={<RoleBadge role={request.role} />} />
        <CardRow icon={<Car size={16} className="text-gray-500" />} label="پارکینگ" value={request.has_parking ? `${request.parking_count || 1} عدد` : 'ندارد'} />
        <CardRow icon={<Calendar size={16} className="text-gray-500" />} label="تاریخ" value={moment(request.created_at).format('jYYYY/jMM/jDD')} />
      </div>

      {request.rejection_reason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 my-4">
          <p className="text-sm text-red-700">
            <strong>دلیل رد:</strong> {request.rejection_reason}
          </p>
        </div>
      )}

      {showActions && (
        <div className="flex items-center justify-end gap-2 border-t pt-4 mt-4">
            <button
                onClick={(e) => { e.stopPropagation(); onViewDetails(request); }}
                className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
                <Eye size={16} />
                جزئیات
            </button>
            {(request.status === 'pending' || request.status === 'owner_approved') && (
            <>
              <button
                onClick={handleApprove}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
              >
                <CheckCircle size={16} />
                {request.status === 'owner_approved' ? 'تایید نهایی' : 'تایید'}
              </button>
              <button
                onClick={handleReject}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                <XCircle size={16} />
                رد
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MembershipRequestCard;
