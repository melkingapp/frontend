import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const statusConfig = {
  pending: { 
    icon: Clock, 
    color: "bg-yellow-100 text-yellow-800", 
    text: "در انتظار تایید" 
  },
  owner_approved: { 
    icon: AlertCircle, 
    color: "bg-blue-100 text-blue-800", 
    text: "تایید مالک" 
  },
  manager_approved: { 
    icon: CheckCircle, 
    color: "bg-green-100 text-green-800", 
    text: "تایید مدیر" 
  },
  rejected: { 
    icon: XCircle, 
    color: "bg-red-100 text-red-800", 
    text: "رد شده" 
  },
  approved: { // Legacy support
    icon: CheckCircle, 
    color: "bg-green-100 text-green-800", 
    text: "تایید شده" 
  },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon size={12} />
      {config.text}
    </span>
  );
};

export default StatusBadge;
