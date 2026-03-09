import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const SobreMi = () => {
  return (
    <PageLayout>
      <div className="pt-32 pb-24">
        <div className="container px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-display text-5xl md:text-7xl tracking-wide text-foreground mb-8">
                SOBRE MÍ
              </h1>
              <div className="space-y-6 font-body text-secondary-foreground leading-relaxed">
                <p>
                  Fermin Turban es un cineasta uruguayo nacido en Guichón que trabaja entre
                  la publicidad y el documental.
                </p>
                <p>
                  Ha filmado y dirigido campañas para marcas como L'Oréal, Audi, McDonald's,
                  Mercado Libre y Jeep, siempre buscando combinar sensibilidad documental
                  con un lenguaje visual cinematográfico.
                </p>
                <p>
                  En el terreno documental, cuenta con siete largometrajes estrenados en
                  plataformas como Netflix, NatGeo y VIX, y tiene cuatro proyectos
                  adicionales en desarrollo.
                </p>
                <p>
                  Su búsqueda creativa se centra en la autenticidad: encontrar la verdad en
                  cada imagen, ya sea en un set publicitario o en un documental de largo
                  aliento.
                </p>
              </div>

              {/* Clients & platforms */}
              <div className="mt-12 grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-display text-lg tracking-wider text-primary mb-3">MARCAS</h3>
                  <ul className="font-body text-sm text-muted-foreground space-y-1">
                    {["L'Oréal", "Audi", "McDonald's", "Mercado Libre", "Jeep", "Pilsen", "Farmashop"].map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-display text-lg tracking-wider text-primary mb-3">PLATAFORMAS</h3>
                  <ul className="font-body text-sm text-muted-foreground space-y-1">
                    {["Netflix", "NatGeo", "VIX"].map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Contact */}
              <div className="mt-12 flex items-center gap-6">
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
                  ferminturban@gmail.com
                </a>
              </div>
            </motion.div>

            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[3/4] bg-gradient-to-br from-secondary to-muted rounded flex items-center justify-center">
                <span className="font-display text-8xl text-muted-foreground/20">FT</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SobreMi;
