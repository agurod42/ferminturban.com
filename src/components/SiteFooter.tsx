import { Instagram } from "lucide-react";

const SiteFooter = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="font-body text-xs text-muted-foreground tracking-wider uppercase">
          © {new Date().getFullYear()} Fermin Turban
        </p>
        <div className="flex items-center gap-6">
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
            className="font-body text-xs font-semibold text-muted-foreground hover:text-primary transition-colors tracking-wider"
          >
            IMDb
          </a>
          <a
            href="mailto:ferminturban@gmail.com"
            className="font-body text-xs text-muted-foreground hover:text-primary transition-colors tracking-wider"
          >
            ferminturban@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
