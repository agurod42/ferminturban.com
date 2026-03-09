import { getProjectBySlug } from "@/data/projects";

export const getThumbnail = (slug: string): string | undefined =>
  getProjectBySlug(slug)?.thumbnailUrl;
