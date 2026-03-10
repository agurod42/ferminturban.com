import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

// Logo imports
import audiLogo from "@/assets/logos/about/audi-white.png";
import mcdonaldsLogo from "@/assets/logos/about/mcdonalds-white.png";
import mercadolibreLogo from "@/assets/logos/about/mercadolibre-white.png";
import farmashopLogo from "@/assets/logos/about/farmashop-white.png";
import jeepLogo from "@/assets/logos/about/jeep-white.svg";
import imdbLogo from "@/assets/logos/about/imdb-white.svg";
import aboutPortrait from "@/assets/about-fermin-urban.jpg";

const MarkImage = ({ src, className }: { src: string; className?: string }) => (
  <img src={src} alt="" aria-hidden="true" className={cn("h-auto w-auto max-w-full object-contain", className)} />
);

const LogoLabel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn("font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-white/72 sm:text-[11px]", className)}>
    {children}
  </span>
);

type LogoItemType = {
  name: string;
  logo: ReactNode;
  url: string;
  tileClassName?: string;
  contentClassName?: string;
};

const brands: LogoItemType[] = [
  {
    name: "L'Oréal",
    url: "https://www.loreal.com",
    logo: (
      <span className="font-body text-lg font-semibold uppercase tracking-[0.34em] text-[#f4ecdf] sm:text-xl">
        L'Oréal
      </span>
    ),
  },
  {
    name: "Audi",
    url: "https://www.audi.com",
    logo: <MarkImage src={audiLogo} className="max-h-8 sm:max-h-9" />,
  },
  {
    name: "McDonald's",
    url: "https://www.mcdonalds.com",
    logo: (
      <div className="flex flex-col items-center gap-2">
        <MarkImage src={mcdonaldsLogo} className="max-h-9 sm:max-h-10" />
        <LogoLabel className="text-[#f2c94c]">McDonald's</LogoLabel>
      </div>
    ),
  },
  {
    name: "Mercado Libre",
    url: "https://www.mercadolibre.com",
    logo: (
      <div className="flex flex-col items-center gap-2">
        <MarkImage src={mercadolibreLogo} className="max-h-7 sm:max-h-8" />
        <LogoLabel className="tracking-[0.18em] text-[#f4d96c]">Mercado Libre</LogoLabel>
      </div>
    ),
  },
  {
    name: "Jeep",
    url: "https://www.jeep.com",
    logo: <MarkImage src={jeepLogo} className="max-h-5 sm:max-h-6" />,
  },
  {
    name: "Pilsen",
    url: "https://www.pilsen.com.uy",
    logo: (
      <span className="font-body text-2xl font-medium italic tracking-[0.08em] text-[#cfb47c] sm:text-[2rem]">
        Pilsen
      </span>
    ),
  },
  {
    name: "Farmashop",
    url: "https://www.farmashop.com.uy",
    logo: (
      <div className="flex flex-col items-center gap-2">
        <MarkImage src={farmashopLogo} className="max-h-7 sm:max-h-8" />
        <LogoLabel className="tracking-[0.18em] text-[#b2d95f]">Farmashop</LogoLabel>
      </div>
    ),
  },
];

const platforms: LogoItemType[] = [
  {
    name: "Netflix",
    url: "https://www.netflix.com",
    logo: (
      <span className="font-display text-4xl tracking-[0.24em] text-[#e50914] sm:text-5xl">
        Netflix
      </span>
    ),
  },
  {
    name: "ViX",
    url: "https://www.vix.com",
    logo: (
      <span className="bg-gradient-to-r from-[#ff7a18] via-[#ffd451] to-[#7f6bff] bg-clip-text font-body text-3xl font-semibold uppercase tracking-[0.18em] text-transparent sm:text-4xl">
        ViX
      </span>
    ),
  },
  {
    name: "National Geographic",
    url: "https://www.nationalgeographic.com",
    tileClassName: "col-span-2",
    contentClassName: "justify-start px-1 sm:px-3",
    logo: (
      <div className="flex items-center gap-4">
        <span className="h-10 w-[14px] shrink-0 border-[3px] border-[#f5c518]" aria-hidden="true" />
        <span className="font-body text-left text-[11px] font-semibold uppercase leading-[1.1] tracking-[0.22em] text-white/90 sm:text-xs">
          National
          <br />
          Geographic
        </span>
      </div>
    ),
  },
];

const LogoTile = ({ item, index }: { item: LogoItemType; index: number }) => (
  <motion.a
    href={item.url}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={item.name}
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
    className={cn(
      "group relative flex h-[88px] overflow-hidden rounded-sm border border-white/10 bg-[linear-gradient(135deg,rgba(28,28,28,0.95),rgba(8,8,8,0.92))] px-4 shadow-[0_16px_30px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/18 hover:shadow-[0_20px_34px_rgba(0,0,0,0.36)] sm:h-[94px]",
      item.tileClassName,
    )}
    title={item.name}
  >
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_58%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="pointer-events-none absolute inset-[1px] border border-white/6 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div
      className={cn(
        "relative z-10 flex h-full w-full items-center justify-center transition duration-300 group-hover:scale-[1.01]",
        item.contentClassName,
      )}
    >
      {item.logo}
    </div>
  </motion.a>
);

const SobreMi = () => {
  const { t } = useLanguage();

  return (
    <PageLayout>
      <div className="pt-32 pb-24">
        <div className="container px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left column: Text + Brands & Platforms */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-display text-4xl sm:text-5xl md:text-7xl tracking-wide text-foreground mb-8">
                {t("aboutPage.title")}
              </h1>
              <div className="space-y-6 font-body text-secondary-foreground leading-relaxed">
                <p>{t("aboutPage.bio1")}</p>
                <p>{t("aboutPage.bio2")}</p>
                <p>{t("aboutPage.bio3")}</p>
                <p>{t("aboutPage.bio4")}</p>
              </div>

              {/* Contact */}
              <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6">
                <a
                  href="https://www.instagram.com/ferminturban"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="https://www.imdb.com/es-es/name/nm14037227/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="IMDb"
                >
                  <img
                    src={imdbLogo}
                    alt="IMDb"
                    className="h-4 w-auto opacity-70 transition-opacity duration-300 hover:opacity-100"
                  />
                </a>
                <a
                  href="mailto:ferminturban@gmail.com"
                  className="font-body text-sm text-muted-foreground hover:text-primary transition-colors tracking-wider"
                >
                  ferminturban@gmail.com
                </a>
              </div>

              {/* Brands */}
              <div className="mt-16 border-t border-border/50 pt-10">
                <h3 className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
                  {t("aboutPage.brands")}
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {brands.map((brand, i) => (
                    <LogoTile key={brand.name} item={brand} index={i} />
                  ))}
                </div>
              </div>

              {/* Platforms */}
              <div className="mt-10 border-t border-border/50 pt-10">
                <h3 className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
                  {t("aboutPage.platforms")}
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {platforms.map((platform, i) => (
                    <LogoTile key={platform.name} item={platform} index={i} />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right column: Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:sticky lg:top-32"
            >
              <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-8 h-36 w-36 rounded-full bg-white/8 blur-3xl" />
              <div className="relative overflow-hidden rounded-sm border border-white/10 bg-card shadow-[0_30px_60px_rgba(0,0,0,0.38)]">
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <img
                  src={aboutPortrait}
                  alt="Fermin Urban filming with a cinema camera"
                  className="aspect-[3/4] w-full object-cover object-center"
                  loading="eager"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SobreMi;
