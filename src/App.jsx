import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { publicRoutes } from "./routes/publicRoutes";
import { managerRoutes } from "./routes/managerRoutes";
import { residentRoutes } from "./routes/residentRoutes";
import ScrollToTop from "./shared/components/shared/display/ScrollToTop";
import AuthMonitor from "./shared/components/AuthMonitor";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <AuthMonitor />

      <Toaster richColors position="top-center"
        toastOptions={{
          style: {
            fontSize: '18px',
            fontWeight: 500,
          }
        }} />

      <Routes>
        {[...publicRoutes, ...managerRoutes, ...residentRoutes].map((route, index) => (
          <Route key={index} path={route.path} element={route.element}>
            {route.children?.map((child, i) => (
              <Route
                key={i}
                index={child.index}
                path={child.path}
                element={child.element}
              />
            ))}
          </Route>
        ))}
      </Routes>
    </>
  );
}
