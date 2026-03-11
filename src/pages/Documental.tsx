import { useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import ProjectCard from "@/components/ProjectCard";
import { useLanguage } from "@/hooks/useLanguage";
import { preloadProjectMedia, scheduleIdle } from "@/lib/media-preload";
import { usePublicContent } from "@/hooks/usePublicContent";

const Documental = () => {
  const { t } = useLanguage();
  const { getProjectsByCategory } = usePublicContent();
  const projects = getProjectsByCategory("documental");

  useEffect(() => {
    scheduleIdle(() => {
      projects.slice(0, 7).forEach((project, index) => {
        preloadProjectMedia(project, {
          includeGallery: false,
          priority: index < 2 ? "high" : "low",
        });
      });
    });
  }, [projects]);

  return (
    <PageLayout>
      <div className="pt-32 pb-24">
        <div className="container px-6 md:px-12">
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl tracking-wide text-foreground mb-4">
            {t("documentaryPage.title")}
          </h1>
          <p className="font-body text-muted-foreground text-sm tracking-wider uppercase mb-16 max-w-lg">
            {t("documentaryPage.description")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, i) => (
              <ProjectCard key={project.slug} project={project} index={i} />
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Documental;
