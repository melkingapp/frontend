import Layout from "../layout/publicLayout/Layout";
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Features from "../pages/public/Features";
import Contact from "../pages/public/Contact";
import AuthLayout from "../layout/publicLayout/AuthLayout";
import RoleSelector from "../features/authentication/components/RoleSelector";
import LoginForm from "../features/authentication/LoginForm";

export const publicRoutes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "features", element: <Features /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
    ]
  },
  {
    path: "/login",
    element: <AuthLayout />,
    children: [
      { index: true, element: <RoleSelector /> },
      { path: ":role", element: <LoginForm /> }
    ]
  }
];
