import { useState } from "react";
import { MessageSquare, Send, HelpCircle, Phone, Mail, MapPin, Clock, Sparkles } from "lucide-react";
import Button from "../../shared/components/shared/feedback/Button";
import InputField from "../../shared/components/shared/inputs/InputField";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to backend endpoint if needed
    alert("پیام شما ثبت شد. با شما تماس خواهیم گرفت.");
    setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
  };

  const contactCards = [
    {
      icon: Phone,
      title: "تماس تلفنی",
      subtitle: "پشتیبانی فوری",
      info: "09393545438",
    },
    {
      icon: Mail,
      title: "ایمیل",
      subtitle: "پاسخ در ۲۴ ساعت",
      info: "melkingapp@gmail.com",
    },
    {
      icon: MapPin,
      title: "آدرس دفتر",
      subtitle: "مراجعه حضوری",
      info: "تهران، دانشگاه صنعتی شریف",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white" dir="rtl">
      {/* Hero - Enhanced */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1c2e4e] via-[#2a4166] to-[#1c2e4e] px-6 py-16 md:py-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#d3b66c]/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1c2e4e]/50 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative mx-auto w-full max-w-7xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[#d3b66c] font-medium">ما اینجا هستیم تا کمک کنیم</span>
          </div>
          <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-4">
            تماس با ما
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl leading-relaxed">
            سوال، پیشنهاد یا درخواست همکاری دارید؟ ما با کمال میل آماده پاسخگویی و کمک به شما هستیم.
          </p>
        </div>
      </section>
      {/* Main Content */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto w-full max-w-7xl px-6">
          {/* Contact Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {contactCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#f1e8d1]"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#d3b66c]/10 rounded-full blur-2xl group-hover:bg-[#d3b66c]/20 transition-all"></div>
                  <div className="relative">
                    <div className="inline-flex p-3 rounded-xl bg-[#d3b66c]/20 mb-4">
                      <Icon className="h-6 w-6 text-[#927d44]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1c2e4e] mb-1">{card.title}</h3>
                    <p className="text-[#4a5d84] text-sm mb-2">{card.subtitle}</p>
                    <p className="text-[#1c2e4e] font-semibold text-sm">{card.info}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-12 lg:grid-cols-3">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border-2 border-[#f1e8d1] bg-white p-8 md:p-10 shadow-xl relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#d3b66c]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1c2e4e]/5 rounded-full blur-3xl"></div>

                <div className="relative">
                  <div className="mb-8">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#d3b66c] to-[#927d44] shadow-lg">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-[#1c2e4e]">برای ما پیام بگذارید</h2>
                    </div>
                    <p className="text-[#4a5d84] text-lg">فرم زیر را تکمیل کنید و ما در اسرع وقت با شما تماس خواهیم گرفت.</p>
                  </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-semibold text-[#1c2e4e]">نام و نام خانوادگی *</label>
                      <InputField
                        name="name"
                        id="name"
                        required
                        placeholder="نام خود را وارد کنید"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-semibold text-[#1c2e4e]">شماره تماس *</label>
                      <InputField
                        name="phone"
                        id="phone"
                        type="tel"
                        required
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-[#1c2e4e]">ایمیل *</label>
                    <InputField
                      name="email"
                      id="email"
                      type="email"
                      required
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-sm font-semibold text-[#1c2e4e]">موضوع *</label>
                    <select
                      id="subject"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5A8C] border-gray-200"
                      value={formData.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      required
                    >
                      <option value="" disabled>موضوع پیام خود را انتخاب کنید</option>
                      <option value="support">پشتیبانی فنی و اپلیکیشن</option>
                      <option value="sales">امور مالی و فروش (مخصوص مدیران ساختمان)</option>
                      <option value="partnership">همکاری (برای متخصصین و فروشندگان بازارچه خدمات)</option>
                      <option value="feedback">پیشنهادات و انتقادات</option>
                      <option value="other">سایر موارد</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-semibold text-[#1c2e4e]">متن پیام شما *</label>
                    <textarea
                      id="message"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5A8C] border-gray-200"
                      required
                      rows={6}
                      placeholder="پیام خود را اینجا بنویسید..."
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-[#1c2e4e] to-[#2a4166] hover:from-[#0b111a] hover:to-[#1c2e4e] md:w-auto text-white py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Send className="h-5 w-5" />
                      ارسال پیام
                    </span>
                  </Button>
                </form>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border-2 border-[#d3b66c]/30 bg-gradient-to-br from-[#fbf8f0] to-white shadow-lg">
                <div className="flex items-start gap-6 p-6">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d3b66c] to-[#927d44] shadow-lg">
                    <HelpCircle className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-bold text-[#1c2e4e]">قبل از تماس، پاسخ سوالتان اینجا نیست؟</h3>
                    <p className="mb-4 text-[#4a5d84]">
                      ما به پرتکرارترین سوالات مدیران و ساکنین در بخش سوالات متداول پاسخ داده‌ایم.
                    </p>
                    <a 
                      href="/#faq" 
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#d3b66c] bg-[#d3b66c]/10 text-[#927d44] hover:bg-[#d3b66c] hover:text-white transition-all font-semibold"
                    >
                      مشاهده سوالات متداول
                      <Send className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* Sidebar: Contact Info */}
            <aside className="space-y-6">
              {/* Office Hours - Enhanced */}
              <div className="rounded-2xl border-2 border-[#f1e8d1] bg-gradient-to-br from-[#fbf8f0] to-white p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#1c2e4e] to-[#2a4166] shadow-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold text-[#1c2e4e] text-lg">ساعات پاسخ‌گویی</h4>
                </div>
                <ul className="text-sm text-[#4a5d84] space-y-3">
                  <li className="flex items-center justify-between pb-3 border-b border-[#f1e8d1]">
                    <span className="font-semibold text-[#1c2e4e]">شنبه تا چهارشنبه:</span>
                    <span className="text-[#4a5d84]">۹ تا ۱۸</span>
                  </li>
                  <li className="flex items-center justify-between pb-3 border-b border-[#f1e8d1]">
                    <span className="font-semibold text-[#1c2e4e]">پنجشنبه:</span>
                    <span className="text-[#4a5d84]">۹ تا ۱۴</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="font-semibold text-[#1c2e4e]">جمعه:</span>
                    <span className="text-[#4a5d84]">فقط تیکت</span>
                  </li>
                </ul>
              </div>

              {/* Quick Support */}
              <div className="rounded-2xl border-2 border-[#d3b66c]/30 bg-gradient-to-br from-[#fbf8f0] to-white p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#d3b66c] to-[#927d44] shadow-lg">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold text-[#1c2e4e] text-lg">پاسخ سریع‌تر</h4>
                </div>
                <p className="text-sm text-[#4a5d84] mb-4">
                  برای پاسخ فوری، می‌توانید مستقیماً با ما تماس بگیرید.
                </p>
                <a 
                  href="tel:09393545438" 
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-[#1c2e4e] to-[#2a4166] text-white rounded-xl hover:from-[#0b111a] hover:to-[#1c2e4e] transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  <Phone className="h-4 w-4" />
                  تماس فوری
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}


