import { useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import ProjectCard from "@/components/ProjectCard";
import { useLanguage } from "@/hooks/useLanguage";
import { preloadProjectMedia, scheduleIdle } from "@/lib/media-preload";
import { usePublicContent } from "@/hooks/usePublicContent";

const Publicidad = () => {
  const { t } = useLanguage();
  const { getProjectsByCategory } = usePublicContent();
  const projects = getProjectsByCategory("publicidad");

  useEffect(() => {
    scheduleIdle(() => {
      projects.slice(0, 8).forEach((project, index) => {
        preloadProjectMedia(project, {
          includeGallery: false,
          priority: index < 3 ? "high" : "low",
        });
      });
    });
  }, [projects]);

  return (
    <PageLayout>
      <div className="pt-32 pb-24">
        <div className="container px-6 md:px-12">
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl tracking-wide text-foreground mb-4">
            {t("advertisingPage.title")}
          </h1>
          <p className="font-body text-muted-foreground text-sm tracking-wider uppercase mb-16 max-w-lg">
            {t("advertisingPage.description")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <ProjectCard key={project.slug} project={project} index={i} />
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Publicidad;
