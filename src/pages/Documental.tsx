import PageLayout from "@/components/PageLayout";
import ProjectCard from "@/components/ProjectCard";
import { getProjectsByCategory } from "@/data/projects";

const Documental = () => {
  const projects = getProjectsByCategory("documental");

  return (
    <PageLayout>
      <div className="pt-32 pb-24">
        <div className="container px-6 md:px-12">
          <h1 className="font-display text-5xl md:text-7xl tracking-wide text-foreground mb-4">
            DOCUMENTAL
          </h1>
          <p className="font-body text-muted-foreground text-sm tracking-wider uppercase mb-16 max-w-lg">
            Siete largometrajes estrenados en Netflix, NatGeo y VIX. Cuatro proyectos en desarrollo.
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
