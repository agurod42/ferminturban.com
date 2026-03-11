import type { AdminProject, ProjectCategory, ProjectStatus } from "@/types/project";

export const categoryLabels: Record<ProjectCategory, string> = {
  publicidad: "Advertising",
  documental: "Documentary",
};

export const statusLabels: Record<ProjectStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export const statusBadgeClassNames: Record<ProjectStatus, string> = {
  draft: "border-amber-500/25 bg-amber-500/10 text-amber-200",
  published: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
  archived: "border-border/60 bg-secondary/40 text-muted-foreground",
};

export const emptyAdminProject: AdminProject = {
  id: "",
  category: "publicidad",
  status: "draft",
  slugEs: "",
  slugEn: "",
  titleEs: "",
  titleEn: "",
  client: "",
  productora: "",
  director: "",
  dop: "",
  mediaType: "video",
  mediaProvider: "vimeo",
  videoUrl: "",
  featured: false,
  sortOrder: 0,
  thumbnailUrl: "",
  thumbnailAltEs: "",
  thumbnailAltEn: "",
  thumbnailAspectRatio: undefined,
  backgroundUrl: "",
  galleryAspectRatio: undefined,
  canonicalUrl: "",
  sourceUrl: "",
  creditsText: "",
  gallery: [],
  galleryItems: [],
};

export const normalizeAdminProject = (project: AdminProject | null): AdminProject => {
  const galleryItems = project?.galleryItems || project?.gallery || [];

  return {
    ...emptyAdminProject,
    ...(project || {}),
    gallery: galleryItems,
    galleryItems,
  };
};

export const uploadFolderForProject = (project: Pick<AdminProject, "id" | "slugEs">) =>
  `projects/${(project.slugEs || project.id || "draft")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "") || "draft"}`;

export const getProjectPreviewHref = (project: Pick<AdminProject, "slugEs">) =>
  project.slugEs ? `/es/proyecto/${project.slugEs}` : null;

export const formatSyncTimestamp = (value?: string) => {
  if (!value) {
    return "Unavailable";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

export const getProjectTimestamp = (project: Pick<AdminProject, "updatedAt" | "createdAt">) =>
  project.updatedAt || project.createdAt || "";

export const sortProjectsForAdmin = (projects: AdminProject[]) =>
  [...projects].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.titleEs.localeCompare(right.titleEs, undefined, { sensitivity: "base" });
  });
