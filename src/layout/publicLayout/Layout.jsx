import { Link, Outlet } from "react-router-dom";
import Header from "../../shared/components/headers/publicHeader/Header";
import Footer from "../../shared/components/footer/Footer";

export default function Layout() {
    return (
        <>
           <Header />

            <main className="min-h-[70vh] px-4 py-8">
                <Outlet /> {/* محتوای صفحه اینجا میاد */}
            </main>
            
            <Footer />
        </>
    );
}
