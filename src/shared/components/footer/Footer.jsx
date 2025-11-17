/* eslint-disable no-unused-vars */
import { Link } from "react-router-dom";
import { Instagram, Twitter, Linkedin } from "lucide-react";
import melkingLogo from "../../../assets/logo/Melking-en-1.svg"
import melkingLogofa from "../../../assets/logo/Melking-fa.svg"

export default function Footer() {
    return (
        <footer className="relative bg-white text-melkingDarkBlue py-6 px-6 overflow-hidden rounded-t-[3rem] shadow-inner border-t-2 border-melkingDarkBlue">
            <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                {/* لوگو و متن */}
                <div className="text-melkingDarkBlue">
                    <div className="w-[130px]">
                        <img src={melkingLogofa} alt="Melking Logo" className="w-full h-auto" />
                    </div>
                    <p className="text-sm leading-6">
                        مدیریت ساختمان، ارتباط و امور مالی به شکلی مدرن و ساده.
                    </p>
                </div>

                {/* لینک‌ها */}
                <div>
                    <h3 className="text-lg font-semibold text-melkingDarkBlue mb-4">دسترسی سریع</h3>
                    <ul className="space-y-3 text-sm text-melkingDarkBlue">
                        <li><Link to="/" className="hover:text-melkingGold transition">خانه</Link></li>
                        <li><Link to="/features" className="hover:text-[#4A5D84] transition">امکانات</Link></li>
                        <li><Link to="/about" className="hover:text-[#4A5D84] transition">درباره ما</Link></li>
                        <li><Link to="/contact" className="hover:text-[#4A5D84] transition">تماس با ما</Link></li>
                        <li><Link to="/privacy" className="hover:text-[#4A5D84] transition">حریم خصوصی</Link></li>
                    </ul>
                </div>

                {/* شبکه اجتماعی */}
                <div>
                    <h3 className="text-lg font-semibold text-melkingDarkBlue mb-4">ما را دنبال کنید</h3>
                    <div className="flex items-center gap-4">
                        {[Instagram, Twitter, Linkedin].map((Icon, i) => (
                            <a key={i} href="#" className="p-2 rounded-xl bg-melkingDarkBlue/10 hover:bg-melkingDarkBlue/20 transition">
                                <Icon className="w-5 h-5 text-melkingDarkBlue" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* کپی‌رایت */}
            <div className="mt-12 pt-6 text-sm text-center text-gray-500 border-t border-gray-200">
                © {new Date().getFullYear()} Melking. تمامی حقوق محفوظ است.
            </div>
        </footer>
    );
}
