import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Project } from "@/data/projects";
import ProjectCard from "./ProjectCard";

interface FilmstripProps {
  projects: Project[];
}

const Filmstrip = ({ projects }: FilmstripProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.6;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative group/strip">
      {/* Scroll buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border rounded-full opacity-0 group-hover/strip:opacity-100 transition-opacity"
        aria-label="Anterior"
      >
        <ChevronLeft size={18} className="text-foreground" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border rounded-full opacity-0 group-hover/strip:opacity-100 transition-opacity"
        aria-label="Siguiente"
      >
        <ChevronRight size={18} className="text-foreground" />
      </button>

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      {/* Scrollable strip */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-6 md:px-12 pb-4 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} index={i} variant="filmstrip" />
        ))}
      </div>
    </div>
  );
};

export default Filmstrip;
