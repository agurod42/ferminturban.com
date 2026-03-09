import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Project } from "@/data/projects";
import { getThumbnail } from "@/data/thumbnails";
import { useLanguage } from "@/hooks/useLanguage";
import { preloadProjectMedia } from "@/lib/media-preload";

interface ProjectCardProps {
  project: Project;
  index: number;
  variant?: "default" | "filmstrip";
}

const ProjectCard = ({ project, index, variant = "default" }: ProjectCardProps) => {
  const thumbnail = getThumbnail(project.slug);
  const { t, projectPath } = useLanguage();
  const isFilmstrip = variant === "filmstrip";
  const aspectRatio = project.thumbnailAspectRatio || 16 / 9;
  const prioritizeImage = isFilmstrip ? index < 2 : index < 6;
  const warmProject = () => {
    preloadProjectMedia(project, {
      includeGallery: false,
      priority: prioritizeImage ? "high" : "low",
    });
  };

  const categoryLabel = project.category === "publicidad"
    ? t("project.advertising")
    : t("project.documentary");

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className={isFilmstrip ? "flex-shrink-0 w-[70vw] md:w-[40vw] lg:w-[30vw]" : ""}
    >
      <Link
        to={projectPath(project)}
        className="group block"
        onMouseEnter={warmProject}
        onFocus={warmProject}
        onTouchStart={warmProject}
      >
        <div
          className="relative overflow-hidden rounded bg-secondary mb-3"
          style={{ aspectRatio }}
        >
          {thumbnail ? (
            <>
              <img
                src={thumbnail}
                alt={project.thumbnailAlt || project.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading={prioritizeImage ? "eager" : "lazy"}
                fetchPriority={prioritizeImage ? "high" : "auto"}
                decoding="async"
              />
              <div className="absolute inset-0 bg-background/40 group-hover:bg-background/10 transition-all duration-700" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <span className="font-display text-5xl text-muted-foreground/40">
                {project.title.charAt(0)}
              </span>
              <div className="absolute bottom-3 left-3">
                <span className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {categoryLabel}
                </span>
              </div>
            </div>
          )}

          {/* Scanline hover effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsla(0,0%,0%,0.03) 2px, hsla(0,0%,0%,0.03) 4px)",
            }}
          />

          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-primary">
              {categoryLabel}
            </span>
          </div>
        </div>
        <h3 className="font-display text-lg tracking-wide text-foreground group-hover:text-primary transition-colors duration-300">
          {project.title.toUpperCase()}
        </h3>
        {project.client && (
          <p className="font-body text-xs text-muted-foreground tracking-wider uppercase mt-0.5">
            {project.client}
          </p>
        )}
      </Link>
    </motion.div>
  );
};

export default ProjectCard;
