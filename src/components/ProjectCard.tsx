import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Project } from "@/data/projects";
import { getThumbnail } from "@/data/thumbnails";

interface ProjectCardProps {
  project: Project;
  index: number;
  variant?: "default" | "filmstrip";
}

const ProjectCard = ({ project, index, variant = "default" }: ProjectCardProps) => {
  const thumbnail = getThumbnail(project.slug);

  const isFilmstrip = variant === "filmstrip";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className={isFilmstrip ? "flex-shrink-0 w-[70vw] md:w-[40vw] lg:w-[30vw]" : ""}
    >
      <Link
        to={`/proyecto/${project.slug}`}
        className="group block"
      >
        <div className="relative overflow-hidden rounded bg-secondary aspect-video mb-3">
          {/* Thumbnail or gradient placeholder */}
          {thumbnail ? (
            <>
              <img
                src={thumbnail}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              {/* Dark overlay that lifts on hover */}
              <div className="absolute inset-0 bg-background/40 group-hover:bg-background/10 transition-all duration-700" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
              <span className="font-display text-6xl text-muted-foreground/20">
                {project.title.charAt(0)}
              </span>
            </div>
          )}

          {/* Scanline hover effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsla(0,0%,0%,0.03) 2px, hsla(0,0%,0%,0.03) 4px)",
            }}
          />

          {/* Bottom gradient for text readability */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Hover title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-primary">
              {project.category === "publicidad" ? "Publicidad" : "Documental"}
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
