import { MessageCircle, Bell, Users, BarChart3 } from "lucide-react";

export default function NotificationsSummary({ onItemClick, highlightableKeys = [] }) {
  const summaryItems = [
    {
      key: "news",
      title: "اخبار ساختمانی",
      description: "مشاهده آخرین اخبار و اطلاعیه‌های ساختمان",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "bg-blue-500",
      highlightable: highlightableKeys.includes("news"),
      onClick: () => onItemClick && onItemClick("news")
    },
    {
      key: "services",
      title: "خدمات",
      description: "مشاهده خدمات ارائه شده در ساختمان",
      icon: <Bell className="w-6 h-6" />,
      color: "bg-green-500",
      highlightable: highlightableKeys.includes("services"),
      onClick: () => onItemClick && onItemClick("services")
    },
    {
      key: "surveys",
      title: "نظر سنجی",
      description: "شرکت در نظرسنجی‌های ساختمان",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "bg-purple-500",
      highlightable: highlightableKeys.includes("surveys"),
      onClick: () => onItemClick && onItemClick("surveys")
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {summaryItems.map((item) => (
        <div
          key={item.key}
          className={`p-6 rounded-lg border-2 transition-all duration-200 cursor-pointer
            ${item.highlightable 
              ? 'border-blue-300 bg-blue-50 shadow-lg' 
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }`}
          onClick={item.onClick}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className={`p-3 rounded-lg ${item.color} text-white`}>
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
