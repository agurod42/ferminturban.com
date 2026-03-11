import type { Lang, Project, ProjectCategory } from "@/types/project";

const DEFAULT_ASPECT_RATIO = 16 / 9;
const ASPECT_RATIO_BUCKET_SIZE = 0.05;

const isValidAspectRatio = (value: number | null | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const bucketAspectRatio = (value: number) =>
  Number(
    (Math.round(value / ASPECT_RATIO_BUCKET_SIZE) * ASPECT_RATIO_BUCKET_SIZE).toFixed(4),
  );

export const getDominantAspectRatio = (
  values: Array<number | null | undefined>,
  fallback = DEFAULT_ASPECT_RATIO,
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

export const getSharedThumbnailAspectRatio = (projects: Project[]) =>
  getDominantAspectRatio(
    projects.map((project) => project.thumbnailAspectRatio),
    DEFAULT_ASPECT_RATIO,
  );

export const computeSharedThumbnailAspectRatio = getSharedThumbnailAspectRatio;

export const getProjectSlug = (project: Project, lang: Lang) =>
  lang === "en" && project.slugEn ? project.slugEn : project.slug;

export const getProjectsByCategory = (projects: Project[], category: ProjectCategory) =>
  projects.filter((project) => project.category === category);

export const getProjectBySlug = (projects: Project[], slug: string) =>
  projects.find((project) => project.slug === slug);

export const getProjectByLocalizedSlug = (
  projects: Project[],
  slug: string,
  lang: Lang,
) => {
  if (lang === "en") {
    return projects.find((project) => project.slugEn === slug || project.slug === slug);
  }

  return projects.find((project) => project.slug === slug || project.slugEn === slug);
};

export const findProjectByLocalizedSlug = getProjectByLocalizedSlug;

export { DEFAULT_ASPECT_RATIO };
