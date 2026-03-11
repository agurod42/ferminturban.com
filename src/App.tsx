import { Suspense } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AdminRoute from "./components/admin/AdminRoute";
import AdminSessionProvider from "./components/admin/AdminSessionProvider";
import AdminThemeProvider from "./components/admin/AdminThemeProvider";
import GoogleAnalytics from "./components/GoogleAnalytics";
import ScrollToTop from "./components/ScrollToTop";
import LanguageRedirect from "./components/LanguageRedirect";
import LangLayout from "./components/LangLayout";
import { lazyRoute } from "./lib/lazyRoute";
import Index from "./pages/Index";

const AdminLogin = lazyRoute(() => import("./pages/admin/AdminLogin"));
const AdminProjects = lazyRoute(() => import("./pages/admin/AdminProjects"));
const AdminProjectForm = lazyRoute(() => import("./pages/admin/AdminProjectForm"));
const Publicidad = lazyRoute(() => import("./pages/Publicidad"));
const Documental = lazyRoute(() => import("./pages/Documental"));
const SobreMi = lazyRoute(() => import("./pages/SobreMi"));
const ProjectDetail = lazyRoute(() => import("./pages/ProjectDetail"));
const NotFound = lazyRoute(() => import("./pages/NotFound"));

const RouteFallback = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const adminTheme =
    typeof window !== "undefined" && window.localStorage.getItem("admin-theme") === "dark"
      ? "dark"
      : "light";

  if (isAdminRoute) {
    return (
      <div
        className="min-h-screen"
        style={{
          background:
            adminTheme === "dark" ? "hsl(0 0% 4%)" : "hsl(40 43% 97%)",
        }}
      />
    );
  }

  return <div className="min-h-screen bg-background" />;
};

const AdminProviderLayout = () => (
  <AdminThemeProvider>
    <AdminSessionProvider>
      <Outlet />
    </AdminSessionProvider>
  </AdminThemeProvider>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<RouteFallback />}>
        <Routes location={location} key={location.pathname}>
          {/* Root → detect language and redirect */}
          <Route path="/" element={<LanguageRedirect />} />

          <Route path="/admin" element={<AdminProviderLayout />}>
            <Route path="login" element={<AdminLogin />} />
            <Route element={<AdminRoute />}>
              <Route index element={<Navigate to="projects" replace />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="projects/new" element={<AdminProjectForm />} />
              <Route path="projects/:id" element={<AdminProjectForm />} />
            </Route>
          </Route>

          {/* Language-prefixed routes */}
          <Route path="/:lang" element={<LangLayout />}>
            <Route index element={<Index />} />
            {/* Spanish route segments */}
            <Route path="publicidad" element={<Publicidad />} />
            <Route path="documental" element={<Documental />} />
            <Route path="sobre-mi" element={<SobreMi />} />
            <Route path="proyecto/:slug" element={<ProjectDetail />} />
            {/* English route segments */}
            <Route path="advertising" element={<Publicidad />} />
            <Route path="documentary" element={<Documental />} />
            <Route path="about-me" element={<SobreMi />} />
            <Route path="project/:slug" element={<ProjectDetail />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <BrowserRouter>
    <GoogleAnalytics />
    <ScrollToTop />
    <AnimatedRoutes />
  </BrowserRouter>
);

export default App;
