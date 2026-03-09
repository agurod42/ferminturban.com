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
  { name: "L'Oréal", logo: null, url: "https://www.loreal.com" },
  { name: "Audi", logo: audiLogo, url: "https://www.audi.com" },
  { name: "McDonald's", logo: mcdonaldsLogo, url: "https://www.mcdonalds.com" },
  { name: "Mercado Libre", logo: mercadolibreLogo, url: "https://www.mercadolibre.com" },
  { name: "Jeep", logo: null, url: "https://www.jeep.com" },
  { name: "Pilsen", logo: null, url: "https://www.pilsen.com.uy" },
  { name: "Farmashop", logo: null, url: "https://www.farmashop.com.uy" },
];

const platforms = [
  { name: "Netflix", logo: netflixLogo, url: "https://www.netflix.com" },
  { name: "NatGeo", logo: natgeoLogo, url: "https://www.nationalgeographic.com" },
  { name: "VIX", logo: null, url: "https://www.vix.com" },
];

type LogoItemType = { name: string; logo: string | null; url: string };

const LogoTile = ({ item, index }: { item: LogoItemType; index: number }) => (
  <motion.a
    href={item.url}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
    className="group flex items-center justify-center aspect-[3/2] border border-border/30 rounded-sm bg-secondary/20 hover:bg-secondary/50 hover:border-border/60 transition-all duration-400"
    title={item.name}
  >
    {item.logo ? (
      <img
        src={item.logo}
        alt={item.name}
        className="max-h-10 max-w-[80px] object-contain opacity-40 group-hover:opacity-90 transition-opacity duration-300 brightness-0 invert"
      />
    ) : (
      <span className="font-display text-lg md:text-xl tracking-widest text-muted-foreground/30 group-hover:text-foreground/80 transition-colors duration-300">
        {item.name.toUpperCase()}
      </span>
    )}
  </motion.a>
);




const SobreMi = () => {
  return (
    <PageLayout>
      <div className="pt-32 pb-24">
        <div className="container px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left column: Text + Brands & Platforms */}
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
              <div className="mt-8 flex items-center gap-6">
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

              {/* Brands */}
              <div className="mt-16 border-t border-border/50 pt-10">
                <h3 className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
                  Marcas
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {brands.map((brand, i) => (
                    <LogoTile key={brand.name} item={brand} index={i} />
                  ))}
                </div>
              </div>

              {/* Platforms */}
              <div className="mt-10 border-t border-border/50 pt-10">
                <h3 className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
                  Plataformas
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {platforms.map((platform, i) => (
                    <LogoTile key={platform.name} item={platform} index={i} />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right column: Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:sticky lg:top-32"
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
