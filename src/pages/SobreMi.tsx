import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import PageLayout from "@/components/PageLayout";

// Logo imports
import audiLogo from "@/assets/logos/audi.png";
import mcdonaldsLogo from "@/assets/logos/mcdonalds.png";
import mercadolibreLogo from "@/assets/logos/mercadolibre.png";
import netflixLogo from "@/assets/logos/netflix.png";
import natgeoLogo from "@/assets/logos/natgeo.png";

const brands = [
  { name: "L'Oréal", logo: null },
  { name: "Audi", logo: audiLogo },
  { name: "McDonald's", logo: mcdonaldsLogo },
  { name: "Mercado Libre", logo: mercadolibreLogo },
  { name: "Jeep", logo: null },
  { name: "Pilsen", logo: null },
  { name: "Farmashop", logo: null },
];

const platforms = [
  { name: "Netflix", logo: netflixLogo },
  { name: "NatGeo", logo: natgeoLogo },
  { name: "VIX", logo: null },
];

const LogoItem = ({ item, index }: { item: { name: string; logo: string | null }; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.06 }}
    className="flex items-center justify-center h-16"
    title={item.name}
  >
    {item.logo ? (
      <img
        src={item.logo}
        alt={item.name}
        className="max-h-10 max-w-[100px] object-contain opacity-50 hover:opacity-100 transition-opacity duration-300 brightness-0 invert"
      />
    ) : (
      <span className="font-body text-sm tracking-wider text-muted-foreground/50 hover:text-foreground/80 transition-colors duration-300 uppercase">
        {item.name}
      </span>
    )}
  </motion.div>
);

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

          {/* ——— BRANDS & PLATFORMS ——— */}
          <div className="mt-24 md:mt-32 border-t border-border/50 pt-16">
            {/* Brands */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-8 text-center">
                Marcas
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4 md:gap-6 items-center">
                {brands.map((brand, i) => (
                  <LogoItem key={brand.name} item={brand} index={i} />
                ))}
              </div>
            </motion.div>

            {/* Platforms */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-16"
            >
              <h3 className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-8 text-center">
                Plataformas
              </h3>
              <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-md mx-auto items-center">
                {platforms.map((platform, i) => (
                  <LogoItem key={platform.name} item={platform} index={i} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SobreMi;
