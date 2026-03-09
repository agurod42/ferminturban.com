import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

// Logo imports
import audiLogo from "@/assets/logos/audi.png";
import mcdonaldsLogo from "@/assets/logos/mcdonalds.png";
import mercadolibreLogo from "@/assets/logos/mercadolibre.png";
import netflixLogo from "@/assets/logos/netflix.png";
import natgeoLogo from "@/assets/logos/natgeo.png";
import lorealLogo from "@/assets/logos/loreal.png";
import pilsenLogo from "@/assets/logos/pilsen.png";
import farmashopLogo from "@/assets/logos/farmashop.png";
import vixLogo from "@/assets/logos/vix.png";
import jeepLogo from "@/assets/logos/jeep.svg";
import imdbLogo from "@/assets/logos/imdb.svg";
import aboutPortrait from "@/assets/about-fermin-urban.jpg";

const brands = [
  { name: "L'Oréal", logo: lorealLogo, url: "https://www.loreal.com", logoClassName: "scale-[1.12]" },
  { name: "Audi", logo: audiLogo, url: "https://www.audi.com", logoClassName: "scale-[1.06]" },
  { name: "McDonald's", logo: mcdonaldsLogo, url: "https://www.mcdonalds.com", logoClassName: "scale-90" },
  { name: "Mercado Libre", logo: mercadolibreLogo, url: "https://www.mercadolibre.com", logoClassName: "scale-[1.04]" },
  { name: "Jeep", logo: jeepLogo, url: "https://www.jeep.com", logoClassName: "scale-[1.08]" },
  { name: "Pilsen", logo: pilsenLogo, url: "https://www.pilsen.com.uy", logoClassName: "scale-[1.02]" },
  { name: "Farmashop", logo: farmashopLogo, url: "https://www.farmashop.com.uy", logoClassName: "scale-[1.18]" },
];

const platforms = [
  { name: "Netflix", logo: netflixLogo, url: "https://www.netflix.com", logoClassName: "scale-90" },
  { name: "NatGeo", logo: natgeoLogo, url: "https://www.nationalgeographic.com", logoClassName: "scale-[1.15]" },
  { name: "VIX", logo: vixLogo, url: "https://www.vix.com", logoClassName: "scale-[1.12]" },
];

type LogoItemType = { name: string; logo: string; url: string; logoClassName?: string };

const LogoTile = ({ item, index }: { item: LogoItemType; index: number }) => (
  <motion.a
    href={item.url}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
    className="group relative flex aspect-[3/2] overflow-hidden rounded-sm border border-white/10 bg-gradient-to-br from-secondary/90 via-secondary/70 to-black/80 p-4 shadow-[0_16px_30px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_20px_34px_rgba(0,0,0,0.36)]"
    title={item.name}
  >
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_58%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative flex h-full w-full items-center justify-center rounded-[2px] border border-white/6 bg-black/25 px-5">
      <img
        src={item.logo}
        alt={item.name}
        className={cn(
          "max-h-10 w-auto max-w-full transform-gpu object-contain brightness-0 invert opacity-85 drop-shadow-[0_0_16px_rgba(255,255,255,0.12)] transition duration-300 group-hover:opacity-100 sm:max-h-11",
          item.logoClassName,
        )}
      />
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
                    className="h-4 w-auto brightness-0 invert opacity-70 transition-opacity duration-300 hover:opacity-100"
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                <div className="grid grid-cols-3 gap-3">
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
