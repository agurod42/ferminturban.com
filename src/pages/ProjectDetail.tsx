import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { getProjectByLocalizedSlug, projects, sharedThumbnailAspectRatio } from "@/data/projects";
import { getThumbnail } from "@/data/thumbnails";
import { useLanguage } from "@/hooks/useLanguage";
import { getOptimizedImageUrl, getResponsiveImageSet } from "@/lib/imgproxy";
import { preloadProjectMedia, scheduleIdle } from "@/lib/media-preload";
import pageTexture from "@/assets/page-texture.jpg";

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang, projectPath, categoryPath } = useLanguage();
  const project = getProjectByLocalizedSlug(slug || "", lang);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    setVideoPlaying(false);
  }, [slug]);

  if (!project) {
    return (
      <PageLayout>
        <div className="pt-32 pb-24 container px-6 md:px-12 text-center">
          <h1 className="font-display text-4xl text-foreground">{t("project.notFound")}</h1>
          <Link to={`/${lang}`} className="font-body text-primary mt-4 inline-block">
            {t("project.backToHome")}
          </Link>
        </div>
      </PageLayout>
    );
  }

  const siblings = projects.filter((p) => p.category === project.category);
  const currentIndex = siblings.findIndex((p) => p.slug === project.slug);
  const prevProject = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const nextProject = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

  const backPath = categoryPath(project.category);
  const categoryLabel = project.category === "publicidad" ? t("project.advertising") : t("project.documentary");
  const thumbnail = getThumbnail(project.slug);
  const heroBackground = thumbnail || project.backgroundUrl || pageTexture;
  const canPlayVideo = project.mediaType === "video" && Boolean(project.videoUrl);
  const heroAspectRatio = project.thumbnailAspectRatio ?? sharedThumbnailAspectRatio;
  const galleryAspectRatio = project.galleryAspectRatio ?? heroAspectRatio;
  const heroImage = getResponsiveImageSet(heroBackground, {
    aspectRatio: heroAspectRatio,
    widths: [960, 1280, 1600, 1920],
    sizes: "100vw",
    mode: "fill",
  });
  const fallbackGalleryBackground = getOptimizedImageUrl(heroBackground, {
    width: 1280,
    height: Math.round(1280 / galleryAspectRatio),
    mode: "fill",
  }) ?? heroBackground;

  const credits = [
    { label: t("project.client"), value: project.client },
    { label: t("project.producer"), value: project.productora },
    { label: t("project.director"), value: project.director },
    { label: t("project.dop"), value: project.dop },
  ].filter((c) => c.value);

  const hasGallery = project.gallery && project.gallery.length > 0;

  useEffect(() => {
    preloadProjectMedia(project, {
      includeGallery: true,
      priority: "high",
    });

    scheduleIdle(() => {
      [prevProject, nextProject].forEach((candidate) => {
        preloadProjectMedia(candidate, {
          includeGallery: false,
          priority: "low",
        });
      });
    });
  }, [nextProject, prevProject, project]);

  return (
    <PageLayout showTexture={false}>
      {/* ——— VIDEO HERO ——— */}
      <section className="relative h-screen flex flex-col">
        <div className="absolute inset-0">
          {videoPlaying && canPlayVideo ? (
            <iframe
              src={project.videoUrl}
              allow="autoplay; fullscreen"
              allowFullScreen
              title={project.title}
              className="absolute inset-0 w-full h-full border-0 gpu-layer paint-contain"
              loading="eager"
            />
          ) : project.mediaType === "image" && heroBackground ? (
            <>
              <img
                src={heroImage?.src ?? heroBackground}
                srcSet={heroImage?.srcSet}
                sizes={heroImage?.sizes}
                width={heroImage?.width}
                height={heroImage?.height}
                alt={project.thumbnailAlt || project.title}
                className="absolute inset-0 h-full w-full object-cover gpu-layer paint-contain"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            </>
          ) : (
            <>
              {heroBackground ? (
                <motion.img
                  src={heroImage?.src ?? heroBackground}
                  srcSet={heroImage?.srcSet}
                  sizes={heroImage?.sizes}
                  width={heroImage?.width}
                  height={heroImage?.height}
                  alt={project.thumbnailAlt || project.title}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  initial={{ scale: 1.08 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 h-full w-full object-cover gpu-layer paint-contain"
                />
              ) : (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${pageTexture})` }}
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

              {canPlayVideo && (
                <button
                  onClick={() => setVideoPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center group cursor-pointer z-10"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    whileHover={{ scale: 1.1 }}
                    className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-foreground/30 flex items-center justify-center bg-background/20 backdrop-blur-sm group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300"
                  >
                    <Play size={36} className="text-foreground ml-1.5 group-hover:text-primary transition-colors" />
                  </motion.div>
                </button>
              )}
            </>
          )}
        </div>

        {(!videoPlaying || !canPlayVideo) && (
          <div className="relative z-20 mt-auto pb-16 md:pb-20">
            <div className="container px-6 md:px-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-4">
                  {categoryLabel}
                  {project.client && (
                    <span className="text-foreground/50"> — {project.client}</span>
                  )}
                </p>
                <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-wide text-foreground leading-[0.95]">
                  {project.title.toUpperCase()}
                </h1>
              </motion.div>
            </div>
          </div>
        )}
      </section>

      {/* ——— CREDITS ——— */}
      {credits.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container px-6 md:px-12 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="border-t border-border/30 pt-10"
            >
              <div className="flex flex-wrap justify-center gap-x-16 gap-y-6">
                {credits.map((credit, i) => (
                  <motion.div
                    key={credit.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="text-center"
                  >
                    <span className="font-body text-[10px] uppercase tracking-[0.25em] text-muted-foreground block mb-1">
                      {credit.label}
                    </span>
                    <span className="font-body text-sm text-foreground">
                      {credit.value}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ——— GALLERY ——— */}
      <section className="pb-20 md:pb-28">
        <div className="container px-6 md:px-12 max-w-6xl mx-auto">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-8"
          >
            {t("project.gallery")}
          </motion.h3>

          <div className="grid grid-cols-12 gap-3 md:gap-4 content-auto">
            {hasGallery ? (
              project.gallery!.map((img, i) => {
                const spans = [
                  "col-span-12 md:col-span-8",
                  "col-span-6 md:col-span-4",
                  "col-span-6 md:col-span-4",
                  "col-span-12 md:col-span-8",
                  "col-span-12 md:col-span-6",
                  "col-span-12 md:col-span-6",
                ];
                const galleryImage = getResponsiveImageSet(img, {
                  aspectRatio: galleryAspectRatio,
                  widths: [480, 720, 960, 1280, 1600],
                  sizes: "(max-width: 767px) 100vw, (max-width: 1023px) 66vw, 50vw",
                  mode: "fill",
                });
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.07 }}
                    className={`relative overflow-hidden rounded-sm gpu-layer paint-contain ${spans[i % spans.length]}`}
                    style={{ aspectRatio: galleryAspectRatio }}
                  >
                    <img
                      src={galleryImage?.src ?? img}
                      srcSet={galleryImage?.srcSet}
                      sizes={galleryImage?.sizes}
                      width={galleryImage?.width}
                      height={galleryImage?.height}
                      alt={`${project.title} – ${i + 1}`}
                      className="absolute inset-0 w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700 gpu-layer"
                      loading={i < 2 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      decoding="async"
                    />
                  </motion.div>
                );
              })
            ) : (
              [0, 1, 2, 3, 4, 5].map((i) => {
                const spans = [
                  "col-span-12 md:col-span-8",
                  "col-span-6 md:col-span-4",
                  "col-span-6 md:col-span-4",
                  "col-span-12 md:col-span-8",
                  "col-span-12 md:col-span-6",
                  "col-span-12 md:col-span-6",
                ];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.07 }}
                    className={`relative overflow-hidden rounded-sm gpu-layer paint-contain ${spans[i]}`}
                    style={{ aspectRatio: galleryAspectRatio }}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-50 hover:opacity-70 transition-opacity duration-500"
                      style={{
                        backgroundImage: heroBackground ? `url(${fallbackGalleryBackground})` : `url(${pageTexture})`,
                        filter: `brightness(${0.4 + i * 0.08}) saturate(${0.6 + i * 0.1})`,
                      }}
                    />
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ——— NAVIGATION ——— */}
      <section className="border-t border-border/30">
        <div className="grid grid-cols-2">
          {prevProject ? (
            <Link
              to={projectPath(prevProject)}
              className="group relative py-14 md:py-20 px-6 md:px-12 border-r border-border/30 hover:bg-secondary/20 transition-colors duration-500"
            >
              <div className="flex items-center gap-3 mb-2">
                <ArrowLeft size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{t("project.previous")}</span>
              </div>
              <p className="font-display text-base sm:text-lg md:text-2xl tracking-wide text-foreground/70 group-hover:text-foreground transition-colors line-clamp-2">
                {prevProject.title.toUpperCase()}
              </p>
            </Link>
          ) : (
            <Link
              to={backPath}
              className="group relative py-14 md:py-20 px-6 md:px-12 border-r border-border/30 hover:bg-secondary/20 transition-colors duration-500"
            >
              <div className="flex items-center gap-3 mb-2">
                <ArrowLeft size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{t("project.back")}</span>
              </div>
              <p className="font-display text-base sm:text-lg md:text-2xl tracking-wide text-foreground/70 group-hover:text-foreground transition-colors line-clamp-2">
                {categoryLabel.toUpperCase()}
              </p>
            </Link>
          )}

          {nextProject ? (
            <Link
              to={projectPath(nextProject)}
              className="group relative py-14 md:py-20 px-6 md:px-12 text-right hover:bg-secondary/20 transition-colors duration-500"
            >
              <div className="flex items-center justify-end gap-3 mb-2">
                <span className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{t("project.next")}</span>
                <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="font-display text-base sm:text-lg md:text-2xl tracking-wide text-foreground/70 group-hover:text-foreground transition-colors line-clamp-2">
                {nextProject.title.toUpperCase()}
              </p>
            </Link>
          ) : (
            <Link
              to={backPath}
              className="group relative py-14 md:py-20 px-6 md:px-12 text-right hover:bg-secondary/20 transition-colors duration-500"
            >
              <div className="flex items-center justify-end gap-3 mb-2">
                <span className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{t("project.back")}</span>
                <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="font-display text-base sm:text-lg md:text-2xl tracking-wide text-foreground/70 group-hover:text-foreground transition-colors line-clamp-2">
                {categoryLabel.toUpperCase()}
              </p>
            </Link>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default ProjectDetail;
