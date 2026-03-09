import PageLayout from "@/components/PageLayout";
import ProjectCard from "@/components/ProjectCard";
import { getProjectsByCategory } from "@/data/projects";
import { useLanguage } from "@/hooks/useLanguage";

const Publicidad = () => {
  const projects = getProjectsByCategory("publicidad");
  const { t } = useLanguage();

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
