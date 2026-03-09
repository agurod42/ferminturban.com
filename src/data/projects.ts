import type { Lang } from "@/hooks/useLanguage";

export type Project = {
  slug: string;
  slugEn?: string;
  title: string;
  category: "publicidad" | "documental";
  client?: string;
  productora?: string;
  director?: string;
  dop?: string;
  videoUrl?: string;
  featured?: boolean;
  gallery?: string[];
};

export const projects: Project[] = [
  // PUBLICIDAD
  { slug: "audi", title: "Audi Q5 – Thrill of Adrenaline", category: "publicidad", client: "Audi", productora: "Futura", director: "Rodra Mendez", dop: "Juanchi Camargo", featured: true },
  { slug: "natalia-oreiro", title: "L'Oréal – Natalia Oreiro", category: "publicidad", client: "L'Oréal", productora: "Somos Wach", director: "Mateo Silvestri", dop: "Fermin Turban", featured: true },
  { slug: "mercado-pago", title: "Mercado Pago con QR", category: "publicidad", client: "Mercado Pago", productora: "Nodo", director: "Grampo", dop: "Fermin Turban", featured: true },
  { slug: "mc-donald", title: "McDonald's Tasty Turbo", category: "publicidad", client: "McDonald's", productora: "Oriental", director: "Juanchi Camargo", dop: "Fermin Turban" },
  { slug: "mercado-libre-bicho", title: "Mercado Libre – Bicho", category: "publicidad", client: "Mercado Libre" },
  { slug: "pilsen", title: "Pilsen", category: "publicidad", client: "Pilsen" },
  { slug: "nativa", title: "Nativa", category: "publicidad", client: "Nativa" },
  { slug: "dream-liso", title: "Dream Liso", category: "publicidad" },
  { slug: "ibutron", title: "Ibutrón", category: "publicidad" },
  { slug: "farmashop-navidad", slugEn: "farmashop-christmas", title: "Farmashop Navidad", category: "publicidad", client: "Farmashop" },
  { slug: "jack-stay-true", title: "Jack – Stay True", category: "publicidad" },
  { slug: "jack-back-rutine", title: "Jack – Back Routine", category: "publicidad" },
  { slug: "jack-backspring-summer", title: "Jack – Spring/Summer", category: "publicidad" },
  { slug: "jack-invierno", slugEn: "jack-winter", title: "Jack – Invierno", category: "publicidad" },
  { slug: "stadium", title: "Miss Stadium", category: "publicidad", client: "Stadium" },
  { slug: "stadium-dia-de-la-madre", slugEn: "stadium-mothers-day", title: "Stadium – Día de la Madre", category: "publicidad", client: "Stadium" },
  { slug: "rada-stadium", title: "Rada Stadium", category: "publicidad" },
  { slug: "cimarronas-punta-carretas", title: "Cimarronas – Punta Carretas", category: "publicidad" },
  { slug: "dia-del-nino-punta-carretas", slugEn: "childrens-day-punta-carretas", title: "Día del Niño – Punta Carretas", category: "publicidad" },
  { slug: "navidad-punta-carretas", slugEn: "christmas-punta-carretas", title: "Navidad – Punta Carretas", category: "publicidad" },
  { slug: "mini-miss-carol", title: "Mini Miss Carol", category: "publicidad" },
  { slug: "nacional-por-el-mundo", slugEn: "nacional-around-the-world", title: "Nacional por el Mundo", category: "publicidad", client: "Nacional" },
  { slug: "nacional-pupo", title: "Nacional – Pupo", category: "publicidad", client: "Nacional" },

  // DOCUMENTAL
  { slug: "higuita", title: "Higuita – El Camino del Escorpión", category: "documental", productora: "Trailer Films", director: "Luis Ara", dop: "Fermin Turban", featured: true },
  { slug: "colombia", title: "Colombia – Camino a la Gloria", category: "documental", productora: "Trailer Films", director: "Luis Ara", dop: "Fermin Turban", featured: true },
  { slug: "brasil2002", title: "Brazil 2002 – Os Bastidores do Penta", category: "documental", productora: "Trailer Films", director: "Luis Ara", dop: "Fermin Turban" },
  { slug: "laura-bozzo", title: "Laura Bozzo", category: "documental", productora: "Trailer Films", director: "Luis Ara", dop: "Fermin Turban" },
  { slug: "el-desafio-imposible", slugEn: "the-impossible-challenge", title: "El Desafío Imposible", category: "documental" },
  { slug: "rada", title: "Rada", category: "documental" },
  { slug: "vicunas", title: "Vicuñas", category: "documental" },
];

export const getProjectsByCategory = (category: "publicidad" | "documental") =>
  projects.filter((p) => p.category === category);

export const getFeaturedProjects = () => projects.filter((p) => p.featured);

export const getProjectBySlug = (slug: string) =>
  projects.find((p) => p.slug === slug);

/** Get the slug for a project in the given language */
export const getProjectSlug = (project: Project, lang: Lang) =>
  lang === "en" && project.slugEn ? project.slugEn : project.slug;

/** Find a project by a localized slug (checks both slug and slugEn) */
export const getProjectByLocalizedSlug = (slug: string, lang: Lang) => {
  if (lang === "en") {
    return projects.find((p) => p.slugEn === slug || p.slug === slug);
  }
  return projects.find((p) => p.slug === slug);
};
