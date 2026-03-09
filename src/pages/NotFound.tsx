import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";

const NotFound = () => {
  return (
    <PageLayout>
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-8xl text-foreground mb-4">404</h1>
          <p className="font-body text-lg text-muted-foreground mb-8">
            Página no encontrada
          </p>
          <Link
            to="/"
            className="font-body text-sm uppercase tracking-[0.2em] border border-foreground/30 px-8 py-3 text-foreground hover:bg-foreground/10 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
