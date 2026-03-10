import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useLanguage } from "@/hooks/useLanguage";

// Logo imports
import audiLogo from "@/assets/logos/about/supplied/audi.png";
import lorealLogo from "@/assets/logos/about/supplied/loreal.png";
import mcdonaldsLogo from "@/assets/logos/about/supplied/mcdonalds.png";
import mercadolibreLogo from "@/assets/logos/about/supplied/mercadolibre.png";
import netflixLogo from "@/assets/logos/about/supplied/netflix.png";
import natgeoLogo from "@/assets/logos/about/supplied/nationalgeographic.png";
import pilsenLogo from "@/assets/logos/about/supplied/pilsen.png";
import farmashopLogo from "@/assets/logos/about/supplied/farmashop.png";
import vixLogo from "@/assets/logos/about/supplied/vix.png";
import imdbLogo from "@/assets/logos/about/imdb-white.svg";
import aboutPortrait from "@/assets/about-fermin-urban.jpg";

type LogoItemType = {
  name: string;
  logo: string;
  url: string;
  logoClassName?: string;
};

const brands: LogoItemType[] = [
  {
    name: "L'Oréal",
    logo: lorealLogo,
    url: "https://www.loreal.com",
    logoClassName: "max-w-[112px] sm:max-w-[126px]",
  },
  {
    name: "Audi",
    logo: audiLogo,
    url: "https://www.audi.com",
    logoClassName: "max-w-[92px] sm:max-w-[102px]",
  },
  {
    name: "McDonald's",
    logo: mcdonaldsLogo,
    url: "https://www.mcdonalds.com",
    logoClassName: "max-h-11 max-w-[94px] sm:max-h-12 sm:max-w-[104px]",
  },
  {
    name: "Mercado Libre",
    logo: mercadolibreLogo,
    url: "https://www.mercadolibre.com",
    logoClassName: "max-w-[110px] sm:max-w-[124px]",
  },
  {
    name: "Pilsen",
    logo: pilsenLogo,
    url: "https://www.pilsen.com.uy",
    logoClassName: "max-w-[104px] sm:max-w-[116px]",
  },
  {
    name: "Farmashop",
    logo: farmashopLogo,
    url: "https://www.farmashop.com.uy",
    logoClassName: "max-w-[110px] sm:max-w-[124px]",
  },
];

const platforms: LogoItemType[] = [
  {
    name: "Netflix",
    logo: netflixLogo,
    url: "https://www.netflix.com",
    logoClassName: "max-w-[108px] sm:max-w-[120px]",
  },
  {
    name: "ViX",
    logo: vixLogo,
    url: "https://www.vix.com",
    logoClassName: "max-w-[96px] sm:max-w-[108px]",
  },
  {
    name: "National Geographic",
    logo: natgeoLogo,
    url: "https://www.nationalgeographic.com",
    logoClassName: "max-w-[112px] sm:max-w-[128px]",
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
    className="group relative flex h-[84px] overflow-hidden rounded bg-secondary/85 transition-all duration-500 hover:-translate-y-0.5 hover:bg-secondary sm:h-[88px]"
    title={item.name}
  >
    <div className="pointer-events-none absolute inset-0 bg-background/35 transition-all duration-500 group-hover:bg-background/15" />
    <div
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsla(0,0%,0%,0.03) 2px, hsla(0,0%,0%,0.03) 4px)",
      }}
    />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/40 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
    <div className="relative z-10 flex h-full w-full items-center justify-center px-2">
      <img
        src={item.logo}
        alt={item.name}
        className={`max-h-10 w-auto max-w-[106px] object-contain opacity-80 transition duration-500 [filter:grayscale(1)_brightness(1.28)_contrast(0.96)] group-hover:scale-[1.04] group-hover:opacity-100 group-hover:[filter:none] sm:max-h-11 ${item.logoClassName ?? ""}`}
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
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
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
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
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
