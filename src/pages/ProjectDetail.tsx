import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { getProjectBySlug } from "@/data/projects";

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = getProjectBySlug(slug || "");

  if (!project) {
    return (
      <PageLayout>
        <div className="pt-32 pb-24 container px-6 md:px-12 text-center">
          <h1 className="font-display text-4xl text-foreground">Proyecto no encontrado</h1>
          <Link to="/" className="font-body text-primary mt-4 inline-block">
            Volver al inicio
          </Link>
        </div>
      </PageLayout>
    );
  }

  const backPath = project.category === "publicidad" ? "/publicidad" : "/documental";

  return (
    <PageLayout>
      <div className="pt-32 pb-24">
        <div className="container px-6 md:px-12 max-w-4xl mx-auto">
          <Link
            to={backPath}
            className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            <span className="uppercase tracking-wider">
              {project.category === "publicidad" ? "Publicidad" : "Documental"}
            </span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl md:text-6xl tracking-wide text-foreground mb-6">
              {project.title.toUpperCase()}
            </h1>

            {/* Video embed placeholder */}
            <div className="video-container bg-secondary rounded mb-10">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-body text-sm text-muted-foreground tracking-wider uppercase">
                  Video
                </span>
              </div>
            </div>

            {/* Credits */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {project.client && (
                <div>
                  <h3 className="font-display text-sm tracking-wider text-primary mb-1">CLIENTE</h3>
                  <p className="font-body text-sm text-secondary-foreground">{project.client}</p>
                </div>
              )}
              {project.productora && (
                <div>
                  <h3 className="font-display text-sm tracking-wider text-primary mb-1">PRODUCTORA</h3>
                  <p className="font-body text-sm text-secondary-foreground">{project.productora}</p>
                </div>
              )}
              {project.director && (
                <div>
                  <h3 className="font-display text-sm tracking-wider text-primary mb-1">DIRECTOR</h3>
                  <p className="font-body text-sm text-secondary-foreground">{project.director}</p>
                </div>
              )}
              {project.dop && (
                <div>
                  <h3 className="font-display text-sm tracking-wider text-primary mb-1">DIR. DE FOTO</h3>
                  <p className="font-body text-sm text-secondary-foreground">{project.dop}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProjectDetail;
