import { Outlet } from "react-router-dom";

export default function AuthLayout() {
    return (
        <div className="min-h-screen h-screen overflow-hidden p-4">
            <div className="w-full">
                <Outlet />
            </div>
        </div>
    );
}
