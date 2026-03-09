import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
    >
      <Link
        to={`/proyecto/${project.slug}`}
        className="group block"
      >
        <div className="relative overflow-hidden rounded bg-secondary aspect-video mb-3">
          {/* Placeholder with title initial */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
            <span className="font-display text-6xl text-muted-foreground/30">
              {project.title.charAt(0)}
            </span>
          </div>
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        <h3 className="font-display text-lg tracking-wide text-foreground group-hover:text-primary transition-colors">
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
