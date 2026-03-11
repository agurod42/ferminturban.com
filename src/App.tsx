import { Suspense, lazy } from "react";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AdminRoute from "./components/admin/AdminRoute";
import AdminSessionProvider from "./components/admin/AdminSessionProvider";
import GoogleAnalytics from "./components/GoogleAnalytics";
import ScrollToTop from "./components/ScrollToTop";
import LanguageRedirect from "./components/LanguageRedirect";
import LangLayout from "./components/LangLayout";
import Index from "./pages/Index";

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const AdminProjectForm = lazy(() => import("./pages/admin/AdminProjectForm"));
const Publicidad = lazy(() => import("./pages/Publicidad"));
const Documental = lazy(() => import("./pages/Documental"));
const SobreMi = lazy(() => import("./pages/SobreMi"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));

const RouteFallback = () => <div className="min-h-screen bg-background" />;

const AdminProviderLayout = () => (
  <AdminSessionProvider>
    <Outlet />
  </AdminSessionProvider>
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
              <Route index element={<AdminDashboard />} />
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
