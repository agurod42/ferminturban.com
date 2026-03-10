import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "./components/ScrollToTop";
import LanguageRedirect from "./components/LanguageRedirect";
import LangLayout from "./components/LangLayout";
import Index from "./pages/Index";

const Publicidad = lazy(() => import("./pages/Publicidad"));
const Documental = lazy(() => import("./pages/Documental"));
const SobreMi = lazy(() => import("./pages/SobreMi"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));

const RouteFallback = () => <div className="min-h-screen bg-background" />;

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<RouteFallback />}>
        <Routes location={location} key={location.pathname}>
          {/* Root → detect language and redirect */}
          <Route path="/" element={<LanguageRedirect />} />

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
    <ScrollToTop />
    <AnimatedRoutes />
  </BrowserRouter>
);

export default App;
