import { Building2, Wallet, Receipt, Bell, MessageSquare, Vote, Award, Sparkles, FileText, MessageCircle, Home, UserCircle, Gift, Lightbulb, ArrowRight, CheckCircle2, TrendingUp, Shield, Clock, Users, Zap, Eye, Heart, Star } from 'lucide-react';

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50" dir="rtl">
      {/* Hero Section - Ultra Modern */}
      <section className="relative overflow-hidden pt-8 pb-12">
        {/* Animated Background with blur effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-[#d3b66c]/20 to-transparent rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-[#1c2e4e]/20 to-transparent rounded-full blur-[100px] animate-pulse delay-1000"></div>
        </div>

        {/* Main Hero Container */}
        <div className="mx-6 mt-4 mb-16">
          <div className="relative rounded-[32px] overflow-hidden backdrop-blur-xl">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1c2e4e] via-[#2a4166] to-[#1c2e4e]"></div>
            
            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none'/%3E%3Cpath d='M50 0v100M0 50h100' stroke='%23fff'/%3E%3C/svg%3E")`
            }}></div>
            
            {/* Content */}
            <div className="relative container mx-auto max-w-7xl px-6 py-12 md:py-16">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left Content */}
                <div className="text-center md:text-right">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-[#d3b66c]/30 px-4 py-2 rounded-full mb-4 shadow-lg">
                    <Sparkles className="w-4 h-4 text-[#d3b66c] animate-pulse" />
                    <span className="text-[#d3b66c] text-sm font-bold">پلتفرم هوشمند مدیریت ساختمان</span>
                  </div>
                  
                  <h1 className="mb-4 text-white text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                    مدیریت
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#d3b66c] via-[#f4d08f] to-[#d3b66c] animate-gradient mb-2">
                      هوشمند
                    </span>
                    ساختمان
                  </h1>
                  
                  <p className="mb-6 text-[#f3eee9] text-base md:text-lg opacity-95 leading-relaxed max-w-2xl mx-auto md:mx-0">
                    پلتفرمی مدرن و یکپارچه برای مدیریت کامل امور مالی، ارتباطی و خدماتی ساختمان
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center md:justify-end mb-6">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-full hover:bg-white/20 transition-all">
                      <CheckCircle2 className="w-5 h-5 text-[#d3b66c]" />
                      <span className="text-white text-sm font-semibold">رایگان برای ساکنین</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-full hover:bg-white/20 transition-all">
                      <Shield className="w-5 h-5 text-[#d3b66c]" />
                      <span className="text-white text-sm font-semibold">امن و قابل اعتماد</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-full hover:bg-white/20 transition-all">
                      <Zap className="w-5 h-5 text-[#d3b66c]" />
                      <span className="text-white text-sm font-semibold">سریع و کاربردی</span>
                    </div>
                  </div>

                  <a 
                    href="/login" 
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#d3b66c] to-[#f4d08f] hover:from-[#b8a04e] hover:to-[#d3b66c] text-[#1c2e4e] px-8 py-4 rounded-xl font-black text-base transition-all hover:scale-105 shadow-2xl hover:shadow-[#d3b66c]/50 group"
                  >
                    شروع کنید
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>

                {/* Right Image */}
                <div className="flex justify-center">
                  <div className="relative group">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#d3b66c] to-[#f4d08f] rounded-[32px] blur-2xl opacity-40 group-hover:opacity-60 transition-all animate-pulse"></div>
                    
                    {/* Icon Container */}
                    <div className="relative bg-white/10 backdrop-blur-2xl border-2 border-[#d3b66c]/30 rounded-[32px] p-10 md:p-12 transform group-hover:scale-105 transition-all duration-500 shadow-2xl">
                      <Building2 className="w-24 h-24 md:w-36 md:h-36 text-[#d3b66c] drop-shadow-2xl" strokeWidth={1.5} />
                      
                      {/* Floating Elements */}
                      <div className="absolute -top-3 -right-3 w-16 h-16 bg-[#d3b66c]/20 rounded-full blur-xl animate-bounce"></div>
                      <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-[#2a4166]/30 rounded-full blur-xl animate-bounce delay-1000"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section - Floating Cards */}
        <div className="relative -mt-12 px-6 z-20">
          <div className="container mx-auto max-w-7xl">
            <div className="bg-white/95 backdrop-blur-xl rounded-[32px] shadow-[0_25px_50px_rgba(0,0,0,0.15)] p-8 md:p-12 border border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                <StatCard icon={<TrendingUp />} value="97٪" label="تسریع در پرداخت" />
                <StatCard icon={<Users />} value="73٪" label="کاهش تنش" />
                <StatCard icon={<Shield />} value="100٪" label="شفافیت مالی" />
                <StatCard icon={<Clock />} value="24/7" label="پشتیبانی" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Building Manager Features Section - Modern Grid */}
      <section className="px-6 py-20 md:py-28 bg-gradient-to-b from-white via-[#fbf8f0] to-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#1c2e4e] to-[#2a4166] px-8 py-4 rounded-full mb-6 shadow-xl">
              <Award className="w-5 h-5 text-[#d3b66c]" />
              <span className="text-[#d3b66c] text-lg md:text-xl font-black">خدمات ویژه مدیر ساختمان</span>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              ابزارهای قدرتمند و حرفه‌ای برای مدیریت بهتر ساختمان
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Wallet className="w-7 h-7" />}
              title="مدیریت مالی و تعریف شارژ"
              description="تعیین شارژ ماهانه، ثبت هزینه‌ها و مدیریت پرداخت‌ها به‌صورت شفاف و منظم"
              color="from-[#1c2e4e] to-[#2a4166]"
            />
            <FeatureCard
              icon={<Receipt className="w-7 h-7" />}
              title="بررسی پرداختی‌ها و سوابق مالی"
              description="مشاهده لحظه‌ای وضعیت مالی و ثبت تراکنش‌ها"
              color="from-[#1c2e4e] to-[#2a4166]"
            />
            <FeatureCard
              icon={<Bell className="w-7 h-7" />}
              title="اطلاع‌رسانی و بیلان داخلی"
              description="انتشار گزارش‌ها و اطلاعیه‌های مهم در فضای امن"
              color="from-[#1c2e4e] to-[#2a4166]"
            />
            <FeatureCard
              icon={<MessageSquare className="w-7 h-7" />}
              title="ارتباط با ساکنین"
              description="گفت‌وگوی مستقیم و اطلاع‌رسانی سریع"
              color="from-[#1c2e4e] to-[#2a4166]"
            />
            <FeatureCard
              icon={<Vote className="w-7 h-7" />}
              title="رأی‌گیری و تصمیم‌گیری جمعی"
              description="برگزاری نظرسنجی آنلاین برای امور ساختمان"
              color="from-[#1c2e4e] to-[#2a4166]"
            />
            <FeatureCard
              icon={<Award className="w-7 h-7" />}
              title="گواهی مخصوص مدیر ساختمان"
              description="صدور گواهی رسمی مدیریت"
              color="from-[#1c2e4e] to-[#2a4166]"
              comingSoon
            />
          </div>
        </div>
      </section>

      {/* General Platform Features Section - Modern Cards */}
      <section className="px-6 py-20 md:py-28 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#1c2e4e] to-[#2a4166] px-8 py-4 rounded-full mb-6 shadow-xl">
              <Sparkles className="w-5 h-5 text-[#d3b66c]" />
              <span className="text-[#d3b66c] text-lg md:text-xl font-black">امکانات عمومی پلتفرم</span>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              هر آنچه برای مدیریت هوشمند ساختمان نیاز دارید
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <PlatformFeatureCard
              icon={<Sparkles className="w-9 h-9" />}
              title="هوش مصنوعی"
              description="دستیار هوشمند برای تحلیل هزینه‌ها"
              comingSoon
            />
            <PlatformFeatureCard
              icon={<FileText className="w-9 h-9" />}
              title="سیستم حسابداری"
              description="پرداخت آنلاین شارژ و مشاهده سوابق"
            />
            <PlatformFeatureCard
              icon={<MessageCircle className="w-9 h-9" />}
              title="ارتباط و تعامل"
              description="چت گروهی و پیام مستقیم"
            />
            <PlatformFeatureCard
              icon={<Vote className="w-9 h-9" />}
              title="تصمیم‌گیری آنلاین"
              description="رأی‌گیری و نظرسنجی"
            />
            <PlatformFeatureCard
              icon={<Home className="w-9 h-9" />}
              title="درخواست خدمات"
              description="ثبت درخواست تعمیر و نظافت"
            />
            <PlatformFeatureCard
              icon={<UserCircle className="w-9 h-9" />}
              title="پروفایل همسایگی"
              description="افزایش شناخت میان ساکنان"
            />
            <PlatformFeatureCard
              icon={<Gift className="w-9 h-9" />}
              title="سیستم پاداش"
              description="دریافت امتیاز و پاداش"
              comingSoon
            />
            <PlatformFeatureCard
              icon={<Lightbulb className="w-9 h-9" />}
              title="مشاوره و پشتیبانی"
              description="دسترسی به تیم پشتیبانی ۲۴/۷"
            />
          </div>
        </div>
      </section>

      {/* Key Values Section - Modern Dark */}
      <section className="px-6 py-20 md:py-28 relative overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1c2e4e] via-[#2a4166] to-[#1c2e4e]"></div>
        
        {/* Animated circles */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#d3b66c]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#d3b66c]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-[#d3b66c] text-3xl md:text-5xl font-black">
              ارزش‌های کلیدی
            </h2>
            <p className="text-[#f3eee9] max-w-2xl mx-auto opacity-95 text-lg">
              ملکینگ با بهره‌گیری از فناوری‌های نوین، تجربه‌ای متفاوت از مدیریت ساختمان ارائه می‌دهد
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ValueCardModern icon="⚡️" title="تسریع ۹۷٪ در پرداخت شارژ" description="سیستم پرداخت آنلاین سریع و ساده" />
            <ValueCardModern icon="💬" title="کاهش ۷۳٪ تنش‌های ساختمانی" description="ارتباطات شفاف و منظم" />
            <ValueCardModern icon="💎" title="۱۰۰٪ شفافیت مالی" description="دسترسی لحظه‌ای به اطلاعات مالی" />
            <ValueCardModern icon="🤝" title="افزایش اعتماد میان ساکنین" description="پلتفرم شفاف و قابل اعتماد" />
            <ValueCardModern icon="🧠" title="تجربه‌ای ساده برای ساکنان" description="رابط کاربری آسان و کاربرپسند" />
            <ValueCardModern icon="🏆" title="مدیریتی پیشرفته برای مدیران" description="ابزارهای حرفه‌ای و کامل" />
          </div>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="bg-[#1c2e4e] border-t border-[#d3b66c]/20 px-6 py-12">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#d3b66c]/20 rounded-2xl">
                <Building2 className="w-8 h-8 text-[#d3b66c]" />
              </div>
              <span className="text-3xl text-[#d3b66c] font-black">ملکینگ</span>
            </div>
            <p className="text-[#f3eee9] opacity-70 text-center">
              مدیریت هوشمند ساختمان، ساده‌تر از همیشه
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div className="text-center group">
      <div className="flex justify-center mb-3 text-[#d3b66c] group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="text-4xl md:text-5xl font-black text-[#1c2e4e] mb-2">{value}</div>
      <div className="text-gray-600 font-semibold">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description, color, comingSoon }) {
  return (
    <div className="group relative">
      <div className="absolute -inset-1 bg-gradient-to-br from-[#d3b66c]/20 to-transparent rounded-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-all"></div>
      <div className="relative bg-white rounded-[32px] p-8 border-2 border-gray-100 hover:border-[#d3b66c]/40 transition-all transform hover:scale-[1.02] hover:shadow-2xl">
        {comingSoon && (
          <div className="absolute left-4 top-4 bg-gradient-to-r from-[#d3b66c]/20 to-[#d3b66c]/10 border border-[#d3b66c]/30 px-4 py-1.5 rounded-full z-10 backdrop-blur-sm">
            <span className="text-[#1c2e4e] text-xs font-black">به‌زودی</span>
          </div>
        )}
        <div className={`p-5 bg-gradient-to-br ${color} rounded-2xl text-white w-fit mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg`}>
          {icon}
        </div>
        <h3 className="mb-3 text-[#1c2e4e] text-xl font-black leading-tight">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function PlatformFeatureCard({ icon, title, description, comingSoon }) {
  return (
    <div className="group bg-gradient-to-br from-[#fbf8f0] to-white hover:from-white hover:to-[#fbf8f0] rounded-3xl p-6 border-2 border-gray-100 hover:border-[#d3b66c]/40 transition-all transform hover:scale-105 hover:shadow-xl h-full">
      {comingSoon && (
        <div className="absolute left-4 top-4 bg-gradient-to-r from-[#d3b66c]/20 to-[#d3b66c]/10 border border-[#d3b66c]/30 px-4 py-1.5 rounded-full z-10 backdrop-blur-sm">
          <span className="text-[#1c2e4e] text-xs font-black">به‌زودی</span>
        </div>
      )}
      <div className="flex flex-col items-center text-center">
        <div className="p-5 bg-gradient-to-br from-[#1c2e4e] to-[#2a4166] rounded-3xl text-white mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl">
          {icon}
        </div>
        <h3 className="mb-2 text-[#1c2e4e] text-lg font-black leading-tight">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function ValueCardModern({ icon, title, description }) {
  return (
    <div className="group bg-white/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#d3b66c]/20 hover:border-[#d3b66c]/40 transition-all transform hover:scale-105 hover:shadow-2xl">
      <div className="flex items-start gap-4">
        <div className="text-5xl shrink-0 transform group-hover:scale-110 group-hover:rotate-6 transition-all">{icon}</div>
        <div>
          <h3 className="mb-2 text-[#d3b66c] text-xl font-black">{title}</h3>
          <p className="text-[#f3eee9] opacity-95 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
