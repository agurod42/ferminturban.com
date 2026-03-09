import publicidadSource from "@/data/scraped/publicidad_enriched.json";
import documentalSource from "@/data/scraped/documental_enriched.json";
import type { Lang } from "@/hooks/useLanguage";

export type ProjectCategory = "publicidad" | "documental";
export const DEFAULT_ASPECT_RATIO = 16 / 9;

export type Project = {
  slug: string;
  slugEn?: string;
  title: string;
  category: ProjectCategory;
  client?: string;
  productora?: string;
  director?: string;
  dop?: string;
  videoUrl?: string;
  mediaType?: "video" | "image";
  mediaProvider?: string;
  featured?: boolean;
  gallery?: string[];
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  thumbnailAspectRatio?: number;
  galleryAspectRatio?: number;
  backgroundUrl?: string;
  canonicalUrl?: string;
  sourceUrl?: string;
  creditsText?: string;
};

type RawRenderedSize = {
  aspect_ratio?: number | null;
};

type RawGalleryImage = {
  url?: string | null;
  full_resolution_aspect_ratio?: number | null;
  rendered_size?: {
    desktop?: RawRenderedSize | null;
    mobile?: RawRenderedSize | null;
  } | null;
};

type RawCredits = {
  cliente?: string | null;
  productora?: string | null;
  director?: string | null;
  directora?: string | null;
  director_de_foto?: string | null;
  director_de_fotografia?: string | null;
  dop?: string | null;
};

type RawMedia = {
  type?: "video" | "image" | null;
  provider?: string | null;
  embed_url?: string | null;
  source_url?: string | null;
  thumbnail?: {
    url?: string | null;
    aspect_ratio?: number | null;
  } | null;
};

type RawItem = {
  name?: string | null;
  slug: string;
  gallery?: {
    thumbnail_url?: string | null;
    thumbnail_alt?: string | null;
    rendered_size?: {
      desktop?: RawRenderedSize | null;
      mobile?: RawRenderedSize | null;
    } | null;
  } | null;
  detail?: {
    campaign_title?: string | null;
    canonical?: string | null;
    url?: string | null;
    detail_page_background?: {
      url?: string | null;
    } | null;
    gallery_images?: RawGalleryImage[] | null;
    credits_text?: string | null;
    credits?: RawCredits | null;
    media?: RawMedia | null;
  } | null;
};

type RawSource = {
  items: RawItem[];
};

const advertisingFeatured = new Set([
  "audi",
  "natalia-oreiro",
  "mercado-pago",
]);

const documentaryFeatured = new Set([
  "higuita",
  "colombia",
]);

const englishSlugMap: Record<string, string> = {
  "farmashop-navidad": "farmashop-christmas",
  "jack-invierno": "jack-winter",
  "stadium-dia-de-la-madre": "stadium-mothers-day",
  "dia-del-nino-punta-carretas": "childrens-day-punta-carretas",
  "navidad-punta-carretas": "christmas-punta-carretas",
  "nacional-por-el-mundo": "nacional-around-the-world",
  "el-desafio-imposible": "the-impossible-challenge",
};

const publicidadData = publicidadSource as RawSource;
const documentalData = documentalSource as RawSource;
const projectCollator = new Intl.Collator("es", {
  sensitivity: "base",
  numeric: true,
});
const ASPECT_RATIO_BUCKET_SIZE = 0.05;

const pickFirst = (...values: Array<string | null | undefined>) =>
  values.find((value) => typeof value === "string" && value.trim().length > 0);

const isValidAspectRatio = (value: number | null | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const pickAspectRatio = (...values: Array<number | null | undefined>) =>
  values.find(isValidAspectRatio);

const bucketAspectRatio = (value: number) =>
  Number(
    (Math.round(value / ASPECT_RATIO_BUCKET_SIZE) * ASPECT_RATIO_BUCKET_SIZE).toFixed(4),
  );

const getDominantAspectRatio = (
  values: Array<number | null | undefined>,
  fallback?: number,
) => {
  const ratios = values.filter(isValidAspectRatio);

  if (!ratios.length) {
    return fallback;
  }

  const counts = new Map<number, number>();

  ratios.forEach((ratio) => {
    const bucket = bucketAspectRatio(ratio);
    counts.set(bucket, (counts.get(bucket) || 0) + 1);
  });

  let bestBucket = fallback;
  let bestCount = -1;

  counts.forEach((count, bucket) => {
    if (count > bestCount) {
      bestBucket = bucket;
      bestCount = count;
    }
  });

  return bestBucket;
};

const buildPlayableVideoUrl = (
  provider: string | null | undefined,
  embedUrl: string | null | undefined,
  sourceUrl: string | null | undefined,
) => {
  const candidate = pickFirst(embedUrl, sourceUrl);
  if (!candidate) {
    return undefined;
  }

  try {
    const url = new URL(candidate);
    url.searchParams.set("autoplay", "1");

    if (provider === "youtube") {
      url.searchParams.set("playsinline", url.searchParams.get("playsinline") || "1");
    }

    return url.toString();
  } catch {
    return candidate;
  }
};

const normalizeProject = (item: RawItem, category: ProjectCategory): Project => {
  const detail = item.detail ?? {};
  const credits = detail.credits ?? {};
  const media = detail.media ?? {};
  const rawGalleryImages = detail.gallery_images ?? [];
  const galleryImages = rawGalleryImages
    .map((image) => image.url || undefined)
    .filter((url): url is string => Boolean(url));
  const galleryAspectRatio = getDominantAspectRatio(
    rawGalleryImages.map((image) => pickAspectRatio(
      image.full_resolution_aspect_ratio,
      image.rendered_size?.desktop?.aspect_ratio,
      image.rendered_size?.mobile?.aspect_ratio,
    )),
  );
  const thumbnailAspectRatio = pickAspectRatio(
    media.thumbnail?.aspect_ratio,
    item.gallery?.rendered_size?.desktop?.aspect_ratio,
    item.gallery?.rendered_size?.mobile?.aspect_ratio,
    galleryAspectRatio,
  );

  return {
    slug: item.slug,
    slugEn: englishSlugMap[item.slug],
    title: pickFirst(detail.campaign_title, item.name, item.slug) ?? item.slug,
    category,
    client: pickFirst(credits.cliente),
    productora: pickFirst(credits.productora),
    director: pickFirst(credits.director, credits.directora),
    dop: pickFirst(credits.director_de_foto, credits.director_de_fotografia, credits.dop),
    videoUrl: media.type === "video"
      ? buildPlayableVideoUrl(media.provider, media.embed_url, media.source_url)
      : undefined,
    mediaType: media.type ?? undefined,
    mediaProvider: pickFirst(media.provider),
    featured: category === "publicidad"
      ? advertisingFeatured.has(item.slug)
      : documentaryFeatured.has(item.slug),
    gallery: galleryImages,
    galleryAspectRatio,
    thumbnailUrl: pickFirst(
      item.gallery?.thumbnail_url,
      media.thumbnail?.url,
      detail.detail_page_background?.url,
    ),
    thumbnailAlt: pickFirst(item.gallery?.thumbnail_alt, detail.campaign_title, item.name),
    thumbnailAspectRatio,
    backgroundUrl: pickFirst(detail.detail_page_background?.url),
    canonicalUrl: pickFirst(detail.canonical),
    sourceUrl: pickFirst(detail.url),
    creditsText: pickFirst(detail.credits_text),
  };
};

const sortProjectsAlphabetically = (items: Project[]) =>
  [...items].sort((left, right) => projectCollator.compare(left.title, right.title));

const advertisingProjects = sortProjectsAlphabetically(
  publicidadData.items.map((item) => normalizeProject(item, "publicidad")),
);

const documentaryProjects = sortProjectsAlphabetically(
  documentalData.items.map((item) => normalizeProject(item, "documental")),
);

export const projects: Project[] = [...advertisingProjects, ...documentaryProjects];
export const sharedThumbnailAspectRatio =
  getDominantAspectRatio(
    projects.map((project) => project.thumbnailAspectRatio),
    DEFAULT_ASPECT_RATIO,
  ) ?? DEFAULT_ASPECT_RATIO;

export const getProjectsByCategory = (category: ProjectCategory) =>
  projects.filter((project) => project.category === category);

export const getFeaturedProjects = () => projects.filter((project) => project.featured);

export const getProjectBySlug = (slug: string) =>
  projects.find((project) => project.slug === slug);

export const getProjectSlug = (project: Project, lang: Lang) =>
  lang === "en" && project.slugEn ? project.slugEn : project.slug;

export const getProjectByLocalizedSlug = (slug: string, lang: Lang) => {
  if (lang === "en") {
    return projects.find((project) => project.slugEn === slug || project.slug === slug);
  }

  return projects.find((project) => project.slug === slug);
};
