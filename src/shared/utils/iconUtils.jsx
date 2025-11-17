import { 
  DollarSign, 
  Zap, 
  Layers, 
  Droplets, 
  Lightbulb, 
  Wrench, 
  Sparkles, 
  Camera, 
  Car, 
  ShoppingCart, 
  Receipt,
  Home,
  Shield,
  SprayCan,
  Check,
  Clock,
  X,
  CheckCircle,
  XCircle,
  Crown
} from "lucide-react";

/**
 * Get icon component for transaction/payment type
 * @param {string} type - Type string
 * @returns {JSX.Element} - Icon component
 */
export const getTypeIcon = (type) => {
  const persianType = type; // Assuming type is already in Persian or English
  
  switch (persianType) {
    // شارژ - آیکون پول
    case "شارژ":
    case "charge":
    case "Charge":
      return <DollarSign className="w-5 h-5 text-blue-500" />;
    
    // قبض آب - آیکون آب
    case "قبض آب":
    case "Water":
    case "water":
    case "water_bill":
      return <Droplets className="w-5 h-5 text-blue-400" />;
    
    // قبض برق - آیکون لامپ
    case "قبض برق":
    case "Electricity":
    case "electricity":
    case "electricity_bill":
      return <Lightbulb className="w-5 h-5 text-yellow-500" />;
    
    // قبض گاز - آیکون شعله
    case "قبض گاز":
    case "gas":
    case "gas_bill":
      return <Zap className="w-5 h-5 text-orange-500" />;
    
    // اقلام خریدنی - آیکون سبد خرید
    case "اقلام خریدنی":
    case "purchases":
    case "Purchases":
      return <ShoppingCart className="w-5 h-5 text-green-500" />;
    
    // تعمیرات - آیکون آچار
    case "تعمیرات":
    case "maintenance":
    case "Maintenance":
    case "repair":
      return <Wrench className="w-5 h-5 text-gray-600" />;
    
    // نظافت - آیکون اسپری
    case "نظافت":
    case "cleaning":
    case "Cleaning":
      return <SprayCan className="w-5 h-5 text-purple-500" />;
    
    // امنیت - آیکون سپر
    case "امنیت":
    case "security":
    case "Security":
      return <Shield className="w-5 h-5 text-red-500" />;
    
    // دوربین - آیکون دوربین
    case "دوربین":
    case "camera":
    case "Camera":
      return <Camera className="w-5 h-5 text-indigo-500" />;
    
    // پارکینگ - آیکون ماشین
    case "پارکینگ":
    case "parking":
    case "Parking":
      return <Car className="w-5 h-5 text-gray-700" />;
    
    // قبض مشترک - آیکون لایه‌ها
    case "قبض مشترک":
    case "shared_bill":
    case "Shared_bill":
      return <Layers className="w-5 h-5 text-cyan-500" />;
    
    // فاکتور فردی - آیکون رسید
    case "فاکتور فردی":
    case "individual_invoice":
      return <Receipt className="w-5 h-5 text-emerald-500" />;
    
    // سایر - آیکون ستاره
    case "سایر":
    case "other":
    case "Other":
      return <Sparkles className="w-5 h-5 text-pink-500" />;
    
    // پیش‌فرض - آیکون خانه
    default:
      return <Home className="w-5 h-5 text-gray-500" />;
  }
};

/**
 * Get icon component for status
 * @param {string} status - Status string
 * @returns {JSX.Element} - Icon component
 */
export const getStatusIcon = (status) => {
  const persianStatus = status; // Assuming status is already in Persian or English
  
  switch (persianStatus) {
    case "پرداخت شده":
    case "paid":
    case "Paid":
      return <Check className="w-4 h-4 text-green-600" />;
    
    case "منتظر پرداخت":
    case "pending":
    case "Pending":
      return <Clock className="w-4 h-4 text-red-600" />;
    
    case "لغو شده":
    case "cancelled":
    case "Cancelled":
      return <X className="w-4 h-4 text-red-600" />;
    
    case "تایید شده":
    case "approved":
    case "Approved":
      return <CheckCircle className="w-4 h-4 text-blue-600" />;
    
    case "تایید نشده":
    case "rejected":
    case "Rejected":
      return <XCircle className="w-4 h-4 text-red-600" />;
    
    case "ممتاز":
    case "excellent":
    case "Excellent":
      return <Crown className="w-4 h-4 text-yellow-600" />;
    
    default:
      return <Clock className="w-4 h-4 text-gray-600" />;
  }
};
