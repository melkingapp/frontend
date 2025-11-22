import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50" dir="rtl">
      <div className="container mx-auto max-w-7xl px-6 py-16">
        <h1 className="text-3xl md:text-5xl font-black text-[#1c2e4e] mb-4">به ملکینگ خوش آمدید</h1>
        <p className="text-gray-700 text-lg mb-8">مدیریت هوشمند ساختمان با امکانات مالی، خدمات و ارتباطات یکپارچه</p>
        <div className="flex gap-4">
          <Link to="/features" className="bg-[#d3b66c] text-[#1c2e4e] px-6 py-3 rounded-xl font-bold">امکانات</Link>
          <Link to="/login" className="bg-[#1c2e4e] text-white px-6 py-3 rounded-xl font-bold">ورود</Link>
        </div>
      </div>
    </div>
  );
}