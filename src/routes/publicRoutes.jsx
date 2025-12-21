import React from 'react';

const Layout = React.lazy(() => import("../layout/publicLayout/Layout"));
const Home = React.lazy(() => import("../pages/public/Home"));
const About = React.lazy(() => import("../pages/public/About"));
const Features = React.lazy(() => import("../pages/public/Features"));
const Contact = React.lazy(() => import("../pages/public/Contact"));
const AuthLayout = React.lazy(() => import("../layout/publicLayout/AuthLayout"));
const RoleSelector = React.lazy(() => import("../features/authentication/components/RoleSelector"));
const LoginForm = React.lazy(() => import("../features/authentication/LoginForm"));

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
