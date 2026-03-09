import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { getProjectBySlug, projects } from "@/data/projects";
import { getThumbnail } from "@/data/thumbnails";
import pageTexture from "@/assets/page-texture.jpg";

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = getProjectBySlug(slug || "");
  const [videoPlaying, setVideoPlaying] = useState(false);

  if (!project) {
    return (
      <PageLayout>
        <div className="pt-32 pb-24 container px-6 md:px-12 text-center">
          <h1 className="font-display text-4xl text-foreground">
            Proyecto no encontrado
          </h1>
          <Link
            to="/"
            className="font-body text-primary mt-4 inline-block"
          >
            Volver al inicio
          </Link>
        </div>
      </PageLayout>
    );
  }

  // Next / previous project within the same category
  const siblings = projects.filter(
    (p) => p.category === project.category
  );
  const currentIndex = siblings.findIndex((p) => p.slug === project.slug);
  const prevProject = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const nextProject =
    currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

  const backPath =
    project.category === "publicidad" ? "/publicidad" : "/documental";
  const categoryLabel =
    project.category === "publicidad" ? "Publicidad" : "Documental";

  const thumbnail = getThumbnail(project.slug);

  const credits = [
    { label: "CLIENTE", value: project.client },
    { label: "PRODUCTORA", value: project.productora },
    { label: "DIRECTOR", value: project.director },
    { label: "DIR. DE FOTOGRAFÍA", value: project.dop },
  ].filter((c) => c.value);

  return (
    <PageLayout showTexture={false}>
      {/* ——— FULL-BLEED HERO ——— */}
      <section className="relative h-[70vh] md:h-[85vh] overflow-hidden flex items-end">
        {/* Background image */}
        {thumbnail ? (
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${thumbnail})` }}
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${pageTexture})` }}
          />
        )}

        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-background/30" />

        {/* Grain */}
        <div className="absolute inset-0 grain-overlay pointer-events-none" />

        {/* Back link — top left */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="absolute top-28 left-6 md:left-12 z-20"
        >
          <Link
            to={backPath}
            className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-foreground/70 hover:text-primary transition-colors"
          >
            <ArrowLeft size={14} />
            {categoryLabel}
          </Link>
        </motion.div>

        {/* Hero content — bottom of hero */}
        <div className="relative z-10 container px-6 md:px-12 pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-4">
              {categoryLabel}
              {project.client && (
                <span className="text-muted-foreground">
                  {" "}
                  — {project.client}
                </span>
              )}
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-wide text-foreground leading-[0.95]">
              {project.title.toUpperCase()}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ——— VIDEO SECTION ——— */}
      <section className="relative bg-background">
        <div className="container px-6 md:px-12 max-w-6xl mx-auto -mt-12 md:-mt-20 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="relative"
          >
            <div className="video-container bg-secondary/50 backdrop-blur-sm border border-border/30 overflow-hidden rounded-sm">
              {videoPlaying ? (
                <iframe
                  src={`${project.videoUrl || "https://player.vimeo.com/video/1119567207"}?autoplay=1&byline=0&title=0`}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  title={project.title}
                />
              ) : (
                <button
                  onClick={() => setVideoPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                >
                  {/* Thumbnail behind play button */}
                  {thumbnail && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                      style={{ backgroundImage: `url(${thumbnail})` }}
                    />
                  )}
                  <div className="absolute inset-0 bg-background/40 group-hover:bg-background/20 transition-colors duration-500" />
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-foreground/40 flex items-center justify-center bg-background/30 backdrop-blur-sm group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300"
                  >
                    <Play
                      size={32}
                      className="text-foreground ml-1 group-hover:text-primary transition-colors"
                    />
                  </motion.div>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ——— CREDITS ——— */}
      {credits.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container px-6 md:px-12 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="border-t border-border/50 pt-12"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8">
                {credits.map((credit, i) => (
                  <motion.div
                    key={credit.label}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <h3 className="font-body text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                      {credit.label}
                    </h3>
                    <p className="font-body text-base text-foreground">
                      {credit.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ——— NEXT / PREV NAVIGATION ——— */}
      <section className="border-t border-border/50">
        <div className="grid grid-cols-2">
          {prevProject ? (
            <Link
              to={`/proyecto/${prevProject.slug}`}
              className="group relative py-16 md:py-24 px-6 md:px-12 border-r border-border/50 hover:bg-secondary/30 transition-colors duration-500"
            >
              <div className="flex items-center gap-3 mb-3">
                <ArrowLeft
                  size={14}
                  className="text-muted-foreground group-hover:text-primary transition-colors"
                />
                <span className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Anterior
                </span>
              </div>
              <p className="font-display text-xl md:text-2xl tracking-wide text-foreground/80 group-hover:text-foreground transition-colors">
                {prevProject.title.toUpperCase()}
              </p>
            </Link>
          ) : (
            <div className="border-r border-border/50" />
          )}

          {nextProject ? (
            <Link
              to={`/proyecto/${nextProject.slug}`}
              className="group relative py-16 md:py-24 px-6 md:px-12 text-right hover:bg-secondary/30 transition-colors duration-500"
            >
              <div className="flex items-center justify-end gap-3 mb-3">
                <span className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Siguiente
                </span>
                <ArrowRight
                  size={14}
                  className="text-muted-foreground group-hover:text-primary transition-colors"
                />
              </div>
              <p className="font-display text-xl md:text-2xl tracking-wide text-foreground/80 group-hover:text-foreground transition-colors">
                {nextProject.title.toUpperCase()}
              </p>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default ProjectDetail;
