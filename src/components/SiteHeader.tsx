import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ftIcon from "@/assets/ft-icon.png";
import { useLanguage } from "@/hooks/useLanguage";
import { getRouteSegment } from "@/hooks/useLanguage";

const SiteHeader = () => {
  const { t, lang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { label: t("nav.home"), path: `/${lang}` },
    { label: t("nav.advertising"), path: `/${lang}/${getRouteSegment(lang, "advertising")}` },
    { label: t("nav.documentary"), path: `/${lang}/${getRouteSegment(lang, "documentary")}` },
    { label: t("nav.about"), path: `/${lang}/${getRouteSegment(lang, "about")}` },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: "linear-gradient(to bottom, hsl(var(--background)) 0%, hsl(var(--background) / 0.6) 40%, transparent 100%)",
          opacity: scrolled ? 1 : 0.5,
        }}
      />
      <div className="container relative z-10 flex items-center justify-between py-6 px-6 md:px-12">
        <Link to={`/${lang}`} className="relative z-10 hover:opacity-80 transition-opacity">
          <img src={ftIcon} alt="FT" className="w-12 md:w-14 h-auto brightness-0 invert" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-8 relative z-10">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-body text-sm uppercase tracking-[0.2em] transition-colors ${
                location.pathname === item.path
                  ? "text-primary"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center gap-[7px] h-6 p-0 relative z-10"
          aria-label="Menu"
        >
          <span className={`block w-6 h-px bg-foreground transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[4px]" : ""}`} />
          <span className={`block w-6 h-px bg-foreground transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[4px]" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 top-16 bg-background/98 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className="font-display text-4xl tracking-widest text-foreground hover:text-primary transition-colors"
              >
                {item.label.toUpperCase()}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default SiteHeader;
