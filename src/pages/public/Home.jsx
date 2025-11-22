import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Building2, Users, DollarSign, BarChart3, Shield, Zap, CheckCircle, Star, Plus, Minus } from "lucide-react";
import constructionImg from "../../assets/images/construction.png";

export default function Home() {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const features = [
        {
            icon: DollarSign,
            title: "مدیریت مالی شفاف",
            description: "مدیر دفاتر جزئی هر تراکنش را ثبت کرده و گزارش‌های دقیق ارائه می‌دهد."
        },
        {
            icon: Shield,
            title: "دستیار حقوقی هوشمند",
            description: "بررسی قراردادها و راهنمایی حقوقی در اساس قوانین ملکی ایران"
        },
        {
            icon: BarChart3,
            title: "گزارش مالی دقیق",
            description: "مشاهده وضعیت پرداخت‌ها در گذشته‌ها و قابلیت‌های هر واحد"
        },
        {
            icon: Building2,
            title: "داشبورد زنده ساختمان",
            description: "مشاهده تمامیت وضعیت ساختمان شما در یک صفحه"
        }
    ];

    const userTypes = [
        {
            title: "ساکن و مالک",
            description: "اطلاع از تاریخ و هزینه",
            icon: Users,
            items: ["پرداخت آنلاین", "مشاهده تاریخچه", "ارسال درخواست"]
        },
        {
            title: "مدیر",
            description: "مدیریت کامل ساختمان",
            icon: Building2,
            items: ["ثبت هزینه‌ها", "بررسی درخواست‌ها", "گزارش‌گیری"]
        }
    ];

    const testimonials = [
        {
            name: "علی محمدی",
            role: "مدیر ساختمان",
            comment: "ملکینگ کار مدیریت ساختمان را خیلی ساده‌تر کرده است. الان همه چیز دیجیتال است.",
            rating: 5
        },
        {
            name: "سارا احمدی",
            role: "ساکن",
            comment: "خیلی راحت می‌تونم هزینه‌هام رو ببینم و پرداخت کنم. عالیه!",
            rating: 5
        },
        {
            name: "محمد رضایی",
            role: "مالک",
            comment: "دستیار حقوقی هوشمند خیلی به من کمک کرد. پیشنهاد می‌کنم.",
            rating: 5
        }
    ];

    const faqs = [
        {
            question: "برای استفاده از ملکینگ، باید رایانه فعل داشته باشم؟",
            answer: "خیر، ملکینگ یک اپلیکیشن وب است که روی هر دستگاهی با مرورگر کار می‌کند."
        },
        {
            question: "اطلاعات مالی و شخصی ساختمان ما امن است؟",
            answer: "بله، ما از بالاترین استانداردهای امنیتی برای حفاظت از اطلاعات شما استفاده می‌کنیم."
        },
        {
            question: "چطور بقیه ساختمان‌های من هست که چه ساختمان‌های کوچک هم امکان استفاده از آن را دارند؟",
            answer: "بله، ملکینگ برای هر نوع و هر اندازه ساختمانی طراحی شده است."
        }
    ];

    return (
        <div className="w-full">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-melkingDarkBlue via-[#2a3f5f] to-melkingDarkBlue text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-melkingGold rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl"></div>
                </div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-center md:text-right space-y-6">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
                                مدیریت ساختمان، <span className="text-melkingGold">آسان</span> و <span className="text-melkingGold">کم دغدغه!</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
                                 با ملکینگ، مدیریت ساختمان، سریع، سودمند و کم دغدغه تر می‌شود. ابزارهایی که در زمان شما صرفه جویی می‌کند و برای مدیریت به شما پاداش می‌دهد.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <button
                                    onClick={() => navigate("/login")}
                                    className="bg-melkingGold hover:bg-[#e6c980] text-melkingDarkBlue px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:scale-105"
                                >
                                    شروع رایگان
                                </button>
                                <button
                                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="border-2 border-white hover:bg-white hover:text-melkingDarkBlue px-8 py-4 rounded-xl font-bold text-lg transition-all"
                                >
                                    ویژگی‌ها
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-melkingGold rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
                                <img
                                    src={constructionImg}
                                    alt="ملکینگ"
                                    className="relative w-80 h-80 object-contain drop-shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
                    </svg>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-melkingDarkBlue mb-4">
                            خدمات ما
                        </h2>
                        <p className="text-xl text-gray-600">
                            همه چیزی که برای مدیریت ساختمان نیاز دارید
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-melkingGold"
                            >
                                <div className="bg-melkingDarkBlue/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                                    <feature.icon className="w-8 h-8 text-melkingDarkBlue" />
                                </div>
                                <h3 className="text-xl font-bold text-melkingDarkBlue mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* User Types Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-melkingDarkBlue mb-4">
                            ملکینگ برای هر نوع ساختمان
                        </h2>
                        <p className="text-xl text-gray-600">
                            چه مالک باشید، چه ساکن، چه مدیر
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {userTypes.map((type, index) => (
                            <div
                                key={index}
                                className="bg-gradient-to-br from-melkingDarkBlue to-[#2a3f5f] text-white p-10 rounded-3xl shadow-2xl"
                            >
                                <div className="flex justify-center mb-6">
                                    <div className="bg-melkingGold w-20 h-20 rounded-2xl flex items-center justify-center">
                                        <type.icon className="w-10 h-10 text-melkingDarkBlue" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-center mb-2">{type.title}</h3>
                                <p className="text-center text-gray-200 mb-6">{type.description}</p>
                                <ul className="space-y-3">
                                    {type.items.map((item, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-melkingGold flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-melkingDarkBlue mb-4">
                            نظرات کاربران
                        </h2>
                        <p className="text-xl text-gray-600">
                            آنچه کاربران ما می‌گویند
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-melkingGold text-melkingGold" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 leading-relaxed">
                                    "{testimonial.comment}"
                                </p>
                                <div className="border-t pt-4">
                                    <p className="font-bold text-melkingDarkBlue">{testimonial.name}</p>
                                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-melkingDarkBlue mb-4">
                            سوالات <span className="text-melkingGold">شما را پاسخ دادیم!</span>
                        </h2>
                        <p className="text-xl text-gray-600">
                            پرسش‌های متداول
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-melkingGold transition-all"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full p-6 text-right flex justify-between items-center hover:bg-gray-50 transition-all"
                                >
                                    <span className="font-bold text-lg text-melkingDarkBlue">
                                        {faq.question}
                                    </span>
                                    {openFaq === index ? (
                                        <Minus className="w-6 h-6 text-melkingGold flex-shrink-0" />
                                    ) : (
                                        <Plus className="w-6 h-6 text-melkingDarkBlue flex-shrink-0" />
                                    )}
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-melkingDarkBlue to-[#2a3f5f] text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-black mb-6">
                        آماده شروع هستید؟
                    </h2>
                    <p className="text-xl text-gray-200 mb-8">
                        همین الان ثبت‌نام کنید و مدیریت ساختمان را تجربه کنید
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-melkingGold hover:bg-[#e6c980] text-melkingDarkBlue px-12 py-5 rounded-xl font-bold text-xl shadow-2xl transition-all transform hover:scale-105"
                    >
                        شروع رایگان
                    </button>
                </div>
            </section>
        </div>
    );
}