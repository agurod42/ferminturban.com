import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useLanguage } from "@/hooks/useLanguage";

// Logo imports
import audiLogo from "@/assets/logos/about/audi-white.png";
import lorealLogo from "@/assets/logos/about/loreal-white.png";
import mcdonaldsLogo from "@/assets/logos/about/mcdonalds-white.png";
import mercadolibreLogo from "@/assets/logos/about/mercadolibre-white.png";
import netflixLogo from "@/assets/logos/about/netflix-white.png";
import natgeoLogo from "@/assets/logos/about/natgeo-white.png";
import pilsenLogo from "@/assets/logos/about/pilsen-white.png";
import farmashopLogo from "@/assets/logos/about/farmashop-white.png";
import vixLogo from "@/assets/logos/about/vix-white.png";
import jeepLogo from "@/assets/logos/about/jeep-white.svg";
import imdbLogo from "@/assets/logos/about/imdb-white.svg";
import aboutPortrait from "@/assets/about-fermin-urban.jpg";

type LogoItemType = {
  name: string;
  logo: string;
  url: string;
  brandFill: string;
  maskSize?: string;
  renderMode?: "mask" | "image";
  tileClassName?: string;
  contentClassName?: string;
};

const brands: LogoItemType[] = [
  {
    name: "L'Oréal",
    logo: lorealLogo,
    url: "https://www.loreal.com",
    brandFill: "linear-gradient(90deg, #d9d0c3 0%, #f6f1e8 100%)",
    maskSize: "155% auto",
  },
  {
    name: "Audi",
    logo: audiLogo,
    url: "https://www.audi.com",
    brandFill: "linear-gradient(90deg, #cfd2d6 0%, #ffffff 100%)",
    maskSize: "138% auto",
  },
  {
    name: "McDonald's",
    logo: mcdonaldsLogo,
    url: "https://www.mcdonalds.com",
    brandFill: "linear-gradient(180deg, #ffd54a 0%, #ffbc0d 100%)",
    maskSize: "108% auto",
  },
  {
    name: "Mercado Libre",
    logo: mercadolibreLogo,
    url: "https://www.mercadolibre.com",
    brandFill: "linear-gradient(180deg, #ffe15a 0%, #f5d000 100%)",
    maskSize: "124% auto",
  },
  {
    name: "Jeep",
    logo: jeepLogo,
    url: "https://www.jeep.com",
    brandFill: "linear-gradient(180deg, #e8ece1 0%, #8fa16c 100%)",
    maskSize: "92% auto",
  },
  {
    name: "Pilsen",
    logo: pilsenLogo,
    url: "https://www.pilsen.com.uy",
    brandFill: "linear-gradient(90deg, #d7b16d 0%, #f0d8a4 100%)",
    maskSize: "150% auto",
  },
  {
    name: "Farmashop",
    logo: farmashopLogo,
    url: "https://www.farmashop.com.uy",
    brandFill: "linear-gradient(180deg, #d7ef5f 0%, #92d73f 100%)",
    renderMode: "image",
  },
];

const platforms: LogoItemType[] = [
  {
    name: "Netflix",
    logo: netflixLogo,
    url: "https://www.netflix.com",
    brandFill: "linear-gradient(180deg, #ff4138 0%, #e50914 100%)",
    maskSize: "108% auto",
  },
  {
    name: "ViX",
    logo: vixLogo,
    url: "https://www.vix.com",
    brandFill: "linear-gradient(90deg, #ff7a18 0%, #ffd451 50%, #8f74ff 100%)",
    maskSize: "138% auto",
  },
  {
    name: "National Geographic",
    logo: natgeoLogo,
    url: "https://www.nationalgeographic.com",
    tileClassName: "col-span-2",
    brandFill: "linear-gradient(90deg, #f5c518 0%, #f5c518 100%)",
    maskSize: "118% auto",
  },
];

const MaskLogo = ({ src, brandFill, maskSize = "contain" }: { src: string; brandFill: string; maskSize?: string }) => {
  const maskStyle = {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: maskSize,
    maskSize,
  } as const;

  return (
    <div className="relative h-12 w-full max-w-[152px] transition-transform duration-300 group-hover:scale-[1.06] sm:h-14 sm:max-w-[168px]">
      <div
        className="absolute inset-0 bg-white/60 opacity-100 drop-shadow-[0_0_14px_rgba(255,255,255,0.14)] transition-opacity duration-300 group-hover:opacity-0"
        style={maskStyle}
      />
      <div
        className="absolute inset-0 opacity-0 drop-shadow-[0_0_18px_rgba(255,255,255,0.18)] transition-opacity duration-300 group-hover:opacity-100"
        style={{ ...maskStyle, background: brandFill }}
      />
    </div>
  );
};

const ImageLogo = ({ src }: { src: string }) => (
  <div className="relative flex h-12 w-full max-w-[152px] items-center justify-center transition-transform duration-300 group-hover:scale-[1.06] sm:h-14 sm:max-w-[168px]">
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="max-h-full max-w-full object-contain opacity-75 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
    />
  </div>
);

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
    className={`group relative flex h-[88px] overflow-hidden rounded-sm border border-white/10 bg-[linear-gradient(135deg,rgba(28,28,28,0.95),rgba(8,8,8,0.92))] px-4 shadow-[0_16px_30px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/18 hover:shadow-[0_20px_34px_rgba(0,0,0,0.36)] sm:h-[94px] ${item.tileClassName ?? ""}`}
    title={item.name}
  >
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_58%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
    <div className={`relative z-10 flex h-full w-full items-center justify-center transition duration-300 group-hover:scale-[1.01] ${item.contentClassName ?? ""}`}>
      {item.renderMode === "image" ? (
        <ImageLogo src={item.logo} />
      ) : (
        <MaskLogo src={item.logo} brandFill={item.brandFill} maskSize={item.maskSize} />
      )}
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
