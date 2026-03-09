import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "./components/ScrollToTop";
import LanguageRedirect from "./components/LanguageRedirect";
import LangLayout from "./components/LangLayout";
import Index from "./pages/Index";
import Publicidad from "./pages/Publicidad";
import Documental from "./pages/Documental";
import SobreMi from "./pages/SobreMi";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
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
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
