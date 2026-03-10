import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageTransition from "@/components/PageTransition";
import Filmstrip from "@/components/Filmstrip";
import { getProjectBySlug, getProjectsByCategory } from "@/data/projects";
import { getHeroVideoPool, getRandomHeroVideo } from "@/data/heroVideos";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/hooks/useLanguage";
import { getResponsiveImageSet } from "@/lib/imgproxy";
import {
  canAggressivelyPreload,
  preconnectOrigins,
  preloadImage,
  preloadProjectMedia,
  prefetchDocument,
  scheduleIdle,
} from "@/lib/media-preload";

const Index = () => {
  const isMobile = useIsMobile();
  const isTablet = typeof window !== "undefined" && window.innerWidth >= 768 && window.innerWidth < 1024;
  const { t, categoryPath } = useLanguage();
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  const deviceType = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";

  const heroVideo = useMemo(() => getRandomHeroVideo(deviceType), [deviceType]);
  const commercialProjects = useMemo(() => getProjectsByCategory("publicidad"), []);
  const docProjects = useMemo(() => getProjectsByCategory("documental"), []);
  const heroProject = getProjectBySlug(heroVideo.projectSlug);
  const heroPoster = heroProject?.thumbnailUrl;
  const heroVideoStartFragment = heroVideo.startAtSeconds > 0 ? `#t=${heroVideo.startAtSeconds}s` : "";
  const heroVideoUrl = `https://player.vimeo.com/video/${heroVideo.id}?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&playsinline=1${heroVideoStartFragment}`;
  const heroPosterImage = getResponsiveImageSet(heroPoster, {
    aspectRatio: isMobile ? 9 / 16 : 16 / 9,
    widths: isMobile ? [720, 900, 1080, 1280] : [960, 1280, 1600, 1920],
    sizes: "100vw",
    mode: "fill",
  });

  useEffect(() => {
    setHeroVideoReady(false);
  }, [heroVideo.id]);

  useEffect(() => {
    preconnectOrigins([
      "https://player.vimeo.com",
      "https://i.vimeocdn.com",
      "https://f.vimeocdn.com",
      "https://assets.zyrosite.com",
      "https://imgproxy.thewisemonkey.co.uk",
    ]);

    preloadImage(heroPosterImage?.src ?? heroPoster, "high");
    prefetchDocument(heroVideoUrl);

    scheduleIdle(() => {
      getHeroVideoPool(deviceType).forEach((candidate) => {
        const project = getProjectBySlug(candidate.projectSlug);
        const candidatePoster = getResponsiveImageSet(project?.thumbnailUrl, {
          aspectRatio: isMobile ? 9 / 16 : 16 / 9,
          widths: isMobile ? [720, 1080] : [1280, 1600],
          sizes: "100vw",
          mode: "fill",
        });
        preloadImage(candidatePoster?.src ?? project?.thumbnailUrl, "low");
      });

      const visibleProjects = [...commercialProjects.slice(0, 5), ...docProjects.slice(0, 4)];
      visibleProjects.forEach((project, index) => {
        preloadProjectMedia(project, {
          includeGallery: false,
          priority: index < 2 ? "high" : "low",
        });
      });

      if (canAggressivelyPreload()) {
        [...commercialProjects, ...docProjects].forEach((project) => {
          preloadProjectMedia(project, { includeGallery: false, priority: "low" });
        });
      }
    });
  }, [commercialProjects, deviceType, docProjects, heroPoster, heroPosterImage?.src, heroVideo.projectSlug, heroVideoUrl]);

  return (
    <PageTransition>
      <div className="grain-overlay min-h-screen">
        <SiteHeader />

        {/* HERO */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {heroPoster && (
            <motion.img
              key={heroPosterImage?.src ?? heroPoster}
              src={heroPosterImage?.src ?? heroPoster}
              srcSet={heroPosterImage?.srcSet}
              sizes={heroPosterImage?.sizes}
              width={heroPosterImage?.width}
              height={heroPosterImage?.height}
              alt={heroProject?.thumbnailAlt || heroProject?.title || "Fermin Turban reel"}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              initial={{ scale: 1.06 }}
              animate={{ scale: 1, opacity: heroVideoReady ? 0 : 1 }}
              transition={{
                scale: { duration: 1.6, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.7, ease: "easeOut" },
              }}
              className="absolute inset-0 h-full w-full object-cover gpu-layer paint-contain"
            />
          )}

          {/* Vimeo reel background */}
          <div
            className="absolute inset-0 overflow-hidden transition-opacity duration-700 gpu-layer paint-contain"
            style={{ opacity: heroVideoReady ? 1 : 0 }}
          >
            <iframe
              src={heroVideoUrl}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300vw] h-[300vh] sm:w-auto sm:h-auto sm:min-w-[110vw] sm:min-h-[110vh] object-cover gpu-layer"
              allow="autoplay; fullscreen"
              loading="eager"
              title="Fermin Turban Reel"
              onLoad={() => setHeroVideoReady(true)}
            />
          </div>
          <div className="absolute inset-0 bg-background/55" />

          <div className="relative z-10 text-center px-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="font-display text-5xl sm:text-5xl sm:text-7xl md:text-9xl tracking-[0.15em] text-foreground"
            >
              FERMIN TURBAN
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="font-body text-sm md:text-base tracking-[0.4em] uppercase text-muted-foreground mt-4"
            >
              {t("hero.subtitle")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-10"
            >
              <Link
                to={categoryPath("publicidad")}
                className="font-body text-sm uppercase tracking-[0.2em] border border-foreground/30 px-8 py-3 text-foreground hover:bg-foreground/10 transition-colors w-full sm:w-auto text-center"
              >
                {t("nav.advertising")}
              </Link>
              <Link
                to={categoryPath("documental")}
                className="font-body text-sm uppercase tracking-[0.2em] border border-foreground/30 px-8 py-3 text-foreground hover:bg-foreground/10 transition-colors w-full sm:w-auto text-center"
              >
                {t("nav.documentary")}
              </Link>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-px h-12 bg-gradient-to-b from-foreground/50 to-transparent"
            />
          </motion.div>
        </section>

        {/* FEATURED COMMERCIAL — FILMSTRIP */}
        <section className="py-24 md:py-32">
          <div className="container px-6 md:px-12 mb-12">
            <div className="flex items-end justify-between">
              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="font-display text-4xl md:text-5xl tracking-wide text-foreground"
              >
                {t("sections.advertising")}
              </motion.h2>
              <Link
                to={categoryPath("publicidad")}
                className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
              >
                {t("sections.viewAll")}
              </Link>
            </div>
          </div>
          <Filmstrip projects={commercialProjects} />
        </section>

        {/* FEATURED DOCUMENTARY — FILMSTRIP */}
        <section className="py-24 md:py-32 border-t border-border">
          <div className="container px-6 md:px-12 mb-12">
            <div className="flex items-end justify-between">
              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="font-display text-4xl md:text-5xl tracking-wide text-foreground"
              >
                {t("sections.documentary")}
              </motion.h2>
              <Link
                to={categoryPath("documental")}
                className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
              >
                {t("sections.viewAll")}
              </Link>
            </div>
          </div>
          <Filmstrip projects={docProjects} />
        </section>

        {/* BIO STRIP */}
        <section className="py-24 md:py-32 border-t border-border">
          <div className="container px-6 md:px-12 max-w-3xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="font-body text-lg md:text-xl leading-relaxed text-secondary-foreground"
            >
              {t("bio.text")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-6 mt-8"
            >
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
                className="font-body text-sm font-semibold text-muted-foreground hover:text-primary transition-colors tracking-wider"
              >
                IMDb
              </a>
              <a
                href="mailto:ferminturban@gmail.com"
                className="font-body text-sm text-muted-foreground hover:text-primary transition-colors tracking-wider"
              >
                {t("bio.contact")}
              </a>
            </motion.div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </PageTransition>
  );
};

export default Index;
