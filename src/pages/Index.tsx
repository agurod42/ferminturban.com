import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import heroTexture from "@/assets/hero-texture.jpg";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageTransition from "@/components/PageTransition";
import Filmstrip from "@/components/Filmstrip";
import { getFeaturedProjects } from "@/data/projects";

const Index = () => {
  const featured = getFeaturedProjects();
  const commercialFeatured = featured.filter((p) => p.category === "publicidad");
  const docFeatured = featured.filter((p) => p.category === "documental");

  return (
    <PageTransition>
      <div className="grain-overlay min-h-screen">
        <SiteHeader />

        {/* HERO */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroTexture})` }}
          />
          <div className="absolute inset-0 bg-background/60" />

          {/* Vimeo reel background */}
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <iframe
              src="https://player.vimeo.com/video/1119567207?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[110vw] min-h-[110vh]"
              allow="autoplay; fullscreen"
              title="Fermin Turban Reel"
            />
          </div>

          <div className="relative z-10 text-center px-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="font-display text-5xl sm:text-5xl sm:text-7xl md:text-9xl tracking-[0.15em] text-foreground"
            >
              FERMIN TURBAN
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="font-body text-sm md:text-base tracking-[0.4em] uppercase text-muted-foreground mt-4"
            >
              Cinematógrafo
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              clasflex-col sm:flex-row items-center justify-center gap-4 sm:tify-center gap-6 mt-10"
            >
              <Link
                to="/publicidad"
                className="font-body text-sm uppercase tracking-[0.2em] border border-foreground/30 px-8 py-3 text-foreground hover:bg-foreground/10 transition-colors"
              >
                Publicidad
              </Link>
              <Link
                to="/documental"
                className="font-body text-sm uppercase tracking-[0.2em] border border-foreground/30 px-8 py-3 text-foreground hover:bg-foreground/10 transition-colors"
              >
                Documental
              </Link>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-px h-12 bg-gradient-to-b from-foreground/50 to-transparent"
            />
          </motion.div>
        </section>

        {/* FEATURED COMMERCIAL — FILMSTRIP */}
        <section className="py-24 md:py-32">
          <div className="container px-6 md:px-12 mb-12">
            <div className="flex items-end justify-between">
              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="font-display text-4xl md:text-5xl tracking-wide text-foreground"
              >
                PUBLICIDAD
              </motion.h2>
              <Link
                to="/publicidad"
                className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
              >
                Ver todo →
              </Link>
            </div>
          </div>
          <Filmstrip projects={commercialFeatured} />
        </section>

        {/* FEATURED DOCUMENTARY — FILMSTRIP */}
        <section className="py-24 md:py-32 border-t border-border">
          <div className="container px-6 md:px-12 mb-12">
            <div className="flex items-end justify-between">
              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="font-display text-4xl md:text-5xl tracking-wide text-foreground"
              >
                DOCUMENTAL
              </motion.h2>
              <Link
                to="/documental"
                className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
              >
                Ver todo →
              </Link>
            </div>
          </div>
          <Filmstrip projects={docFeatured} />
        </section>

        {/* BIO STRIP */}
        <section className="py-24 md:py-32 border-t border-border">
          <div className="container px-6 md:px-12 max-w-3xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="font-body text-lg md:text-xl leading-relaxed text-secondary-foreground"
            >
              Cineasta uruguayo nacido en Guichón. Trabaja entre la publicidad y el
              documental, combinando sensibilidad documental con un lenguaje visual
              cinematográfico y una búsqueda constante de autenticidad.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-6 mt-8"
            >
              <a
                href="https://www.instagram.com/ferminturban"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.imdb.com/es-es/name/nm14037227/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm font-semibold text-muted-foreground hover:text-primary transition-colors tracking-wider"
              >
                IMDb
              </a>
              <a
                href="mailto:ferminturban@gmail.com"
                className="font-body text-sm text-muted-foreground hover:text-primary transition-colors tracking-wider"
              >
                Contacto
              </a>
            </motion.div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </PageTransition>
  );
};

export default Index;
