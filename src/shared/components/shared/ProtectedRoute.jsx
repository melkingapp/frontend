import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const location = useLocation();

    // اگر کاربر وارد نشده، به صفحه login هدایت شود
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // اگر نقش کاربر مجاز است یا هیچ نقش محدودی تعریف نشده
    if (allowedRoles.length === 0 || allowedRoles.includes(user?.role)) {
        return children;
    }

    // اگر نقش کاربر مجاز نیست، بر اساس نقش به صفحه مناسب هدایت شود
    if (user?.role === 'resident') {
        return <Navigate to="/resident" replace />;
    } else if (user?.role === 'manager') {
        return <Navigate to="/manager" replace />;
    }

    // اگر نقش نامشخص است، به صفحه اصلی هدایت شود
    return <Navigate to="/" replace />;
}
