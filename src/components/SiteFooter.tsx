import { Link, useNavigate } from "react-router-dom";
import { Instagram } from "lucide-react";
import ftIcon from "@/assets/ft-icon.png";
import { useLanguage, getRouteSegment } from "@/hooks/useLanguage";

const SiteFooter = () => {
  const { t, lang, switchUrl } = useLanguage();
  const navigate = useNavigate();

  const navLinks = [
    { label: t("nav.home"), path: `/${lang}` },
    { label: t("nav.advertising"), path: `/${lang}/${getRouteSegment(lang, "advertising")}` },
    { label: t("nav.documentary"), path: `/${lang}/${getRouteSegment(lang, "documentary")}` },
    { label: t("nav.about"), path: `/${lang}/${getRouteSegment(lang, "about")}` },
  ];

  const handleSwitchLang = () => {
    const newUrl = switchUrl();
    const newLang = lang === "es" ? "en" : "es";
    localStorage.setItem("lang", newLang);
    navigate(newUrl);
  };

  return (
    <footer className="border-t border-border bg-card/40">
      <div className="container px-6 md:px-12 py-16 md:py-24">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="h-6 w-8 overflow-hidden flex items-center justify-center">
              <img src={ftIcon} alt="FT" className="h-10 brightness-0 invert opacity-50 scale-[1.8]" />
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t("footer.description")}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-lg tracking-widest text-foreground/80 mb-5">
              {t("footer.navigation")}
            </h4>
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="font-body text-sm text-muted-foreground hover:text-primary transition-colors tracking-wide w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg tracking-widest text-foreground/80 mb-5">
              {t("footer.contact")}
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:ferminturban@gmail.com"
                className="font-body text-sm text-muted-foreground hover:text-primary transition-colors tracking-wide"
              >
                ferminturban@gmail.com
              </a>
              <div className="flex items-center gap-4 mt-1">
                <a
                  href="https://www.instagram.com/ferminturban"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://www.imdb.com/es-es/name/nm14037227/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-xs font-semibold text-muted-foreground hover:text-primary transition-colors tracking-wider uppercase"
                >
                  IMDb
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-muted-foreground/60 tracking-wider uppercase">
            © {new Date().getFullYear()} Fermin Turban. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-4">
            <p className="font-body text-xs text-muted-foreground/40 tracking-wide">
              Montevideo, Uruguay
            </p>
            <span className="text-muted-foreground/20">·</span>
            <button
              onClick={handleSwitchLang}
              className="font-body text-xs text-muted-foreground/50 hover:text-primary transition-colors tracking-wider uppercase"
            >
              {lang === "es" ? "EN" : "ES"}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
