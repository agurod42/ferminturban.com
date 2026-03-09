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

  useEffect(() => {
    setVideoPlaying(false);
  }, [slug]);

  if (!project) {
    return (
      <PageLayout>
        <div className="pt-32 pb-24 container px-6 md:px-12 text-center">
          <h1 className="font-display text-4xl text-foreground">Proyecto no encontrado</h1>
          <Link to="/" className="font-body text-primary mt-4 inline-block">Volver al inicio</Link>
        </div>
      </PageLayout>
    );
  }

  const siblings = projects.filter((p) => p.category === project.category);
  const currentIndex = siblings.findIndex((p) => p.slug === project.slug);
  const prevProject = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const nextProject = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

  const backPath = project.category === "publicidad" ? "/publicidad" : "/documental";
  const categoryLabel = project.category === "publicidad" ? "Publicidad" : "Documental";
  const thumbnail = getThumbnail(project.slug);

  const credits = [
    { label: "CLIENTE", value: project.client },
    { label: "PRODUCTORA", value: project.productora },
    { label: "DIRECTOR", value: project.director },
    { label: "DIR. DE FOTOGRAFÍA", value: project.dop },
  ].filter((c) => c.value);

  return (
    <PageLayout showTexture={false}>
      {/* ——— VIDEO HERO ——— */}
      <section className="relative h-screen flex flex-col">
        {/* Video / thumbnail fills the viewport */}
        <div className="absolute inset-0">
          {videoPlaying ? (
            <iframe
              src={`${project.videoUrl || "https://player.vimeo.com/video/1119567207"}?autoplay=1&byline=0&title=0`}
              allow="autoplay; fullscreen"
              allowFullScreen
              title={project.title}
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : (
            <>
              {thumbnail ? (
                <motion.div
                  initial={{ scale: 1.08 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${thumbnail})` }}
                />
              ) : (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${pageTexture})` }}
                />
              )}

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />

              {/* Play button — centered */}
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
                  <Play
                    size={36}
                    className="text-foreground ml-1.5 group-hover:text-primary transition-colors"
                  />
                </motion.div>
              </button>
            </>
          )}
        </div>

        {/* Title overlay — pinned to bottom */}
        {!videoPlaying && (
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
                <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-wide text-foreground leading-[0.95]">
                  {project.title.toUpperCase()}
                </h1>
              </motion.div>
            </div>
          </div>
        )}
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
                    <p className="font-body text-base text-foreground">{credit.value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ——— GALLERY ——— */}
      <section className="py-16 md:py-24">
        <div className="container px-6 md:px-12 max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-8"
          >
            Galería
          </motion.h2>

          {project.gallery && project.gallery.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {project.gallery.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className={`overflow-hidden rounded-sm ${
                    i === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                >
                  <img
                    src={img}
                    alt={`${project.title} – foto ${i + 1}`}
                    className="w-full h-full object-cover aspect-video hover:scale-105 transition-transform duration-700"
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className={`overflow-hidden rounded-sm ${
                    i === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                >
                  <div
                    className="w-full h-full min-h-[160px] md:min-h-[200px] bg-cover bg-center opacity-60"
                    style={{
                      backgroundImage: thumbnail ? `url(${thumbnail})` : `url(${pageTexture})`,
                      filter: `brightness(${0.5 + i * 0.1}) contrast(1.1)`,
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>


      <section className="border-t border-border/50">
        <div className="grid grid-cols-2">
          {prevProject ? (
            <Link to={`/proyecto/${prevProject.slug}`} className="group relative py-16 md:py-24 px-6 md:px-12 border-r border-border/50 hover:bg-secondary/30 transition-colors duration-500">
              <div className="flex items-center gap-3 mb-3">
                <ArrowLeft size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Anterior</span>
              </div>
              <p className="font-display text-xl md:text-2xl tracking-wide text-foreground/80 group-hover:text-foreground transition-colors">{prevProject.title.toUpperCase()}</p>
            </Link>
          ) : (
            <Link to={backPath} className="group relative py-16 md:py-24 px-6 md:px-12 border-r border-border/50 hover:bg-secondary/30 transition-colors duration-500">
              <div className="flex items-center gap-3 mb-3">
                <ArrowLeft size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Volver</span>
              </div>
              <p className="font-display text-xl md:text-2xl tracking-wide text-foreground/80 group-hover:text-foreground transition-colors">{categoryLabel.toUpperCase()}</p>
            </Link>
          )}

          {nextProject ? (
            <Link to={`/proyecto/${nextProject.slug}`} className="group relative py-16 md:py-24 px-6 md:px-12 text-right hover:bg-secondary/30 transition-colors duration-500">
              <div className="flex items-center justify-end gap-3 mb-3">
                <span className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Siguiente</span>
                <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="font-display text-xl md:text-2xl tracking-wide text-foreground/80 group-hover:text-foreground transition-colors">{nextProject.title.toUpperCase()}</p>
            </Link>
          ) : (
            <Link to={backPath} className="group relative py-16 md:py-24 px-6 md:px-12 text-right hover:bg-secondary/30 transition-colors duration-500">
              <div className="flex items-center justify-end gap-3 mb-3">
                <span className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Volver</span>
                <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="font-display text-xl md:text-2xl tracking-wide text-foreground/80 group-hover:text-foreground transition-colors">{categoryLabel.toUpperCase()}</p>
            </Link>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default ProjectDetail;
