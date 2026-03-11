import type { AdminProject, AdminProjectInput, ProjectCategory, ProjectStatus } from "@/types/project";

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

export type AdminProjectFieldKey =
  | "titleEs"
  | "slugEs"
  | "slugEn"
  | "thumbnailUrl"
  | "thumbnailAltEs"
  | "videoUrl"
  | "canonicalUrl"
  | "sourceUrl"
  | "galleryItems";

export type AdminProjectIssue = {
  id: string;
  label: string;
  severity: "critical" | "warning";
  field?: AdminProjectFieldKey;
  blocksSave?: boolean;
  blocksPublish?: boolean;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isPresent = (value?: string | null) => Boolean(value && value.trim().length > 0);

const isValidHttpUrl = (value?: string | null) => {
  if (!isPresent(value)) {
    return false;
  }

  try {
    const url = new URL(String(value));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const toProjectInput = (project: AdminProject): AdminProjectInput => ({
  category: project.category,
  status: project.status,
  slugEs: project.slugEs || "",
  slugEn: project.slugEn || "",
  titleEs: project.titleEs || "",
  titleEn: project.titleEn || "",
  client: project.client || "",
  productora: project.productora || "",
  director: project.director || "",
  dop: project.dop || "",
  mediaType: project.mediaType,
  mediaProvider: project.mediaProvider || "",
  videoUrl: project.videoUrl || "",
  featured: Boolean(project.featured),
  sortOrder: Number(project.sortOrder || 0),
  thumbnailUrl: project.thumbnailUrl || "",
  thumbnailAltEs: project.thumbnailAltEs || "",
  thumbnailAltEn: project.thumbnailAltEn || "",
  thumbnailAspectRatio: project.thumbnailAspectRatio,
  backgroundUrl: project.backgroundUrl || "",
  galleryAspectRatio: project.galleryAspectRatio,
  canonicalUrl: project.canonicalUrl || "",
  sourceUrl: project.sourceUrl || "",
  creditsText: project.creditsText || "",
  galleryItems: (project.galleryItems || project.gallery || []).map((item, index) => ({
    ...item,
    position: index,
  })),
});

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

export const getAdminProjectIssues = (project: AdminProject): AdminProjectIssue[] => {
  const issues: AdminProjectIssue[] = [];
  const galleryItems = project.galleryItems || project.gallery || [];
  const galleryItemsMissingAlt = galleryItems.filter((item) => !isPresent(item.altEs)).length;

  if (!isPresent(project.titleEs)) {
    issues.push({
      id: "missing-title-es",
      label: "Add a Spanish title.",
      severity: "critical",
      field: "titleEs",
      blocksSave: true,
      blocksPublish: true,
    });
  }

  if (!isPresent(project.slugEs)) {
    issues.push({
      id: "missing-slug-es",
      label: "Add a Spanish slug.",
      severity: "critical",
      field: "slugEs",
      blocksSave: true,
      blocksPublish: true,
    });
  } else if (!slugPattern.test(project.slugEs.trim().toLowerCase())) {
    issues.push({
      id: "invalid-slug-es",
      label: "Spanish slug can only contain lowercase letters, numbers, and hyphens.",
      severity: "critical",
      field: "slugEs",
      blocksSave: true,
      blocksPublish: true,
    });
  }

  if (isPresent(project.slugEn) && !slugPattern.test(String(project.slugEn).trim().toLowerCase())) {
    issues.push({
      id: "invalid-slug-en",
      label: "English slug can only contain lowercase letters, numbers, and hyphens.",
      severity: "critical",
      field: "slugEn",
      blocksSave: true,
      blocksPublish: true,
    });
  }

  if (project.mediaType === "video" && !isPresent(project.videoUrl)) {
    issues.push({
      id: "missing-video-url",
      label: "Video projects need a playable video URL before publishing.",
      severity: "critical",
      field: "videoUrl",
      blocksPublish: true,
    });
  }

  if (isPresent(project.videoUrl) && !isValidHttpUrl(project.videoUrl)) {
    issues.push({
      id: "invalid-video-url",
      label: "Video URL must start with http or https.",
      severity: "critical",
      field: "videoUrl",
      blocksSave: true,
      blocksPublish: true,
    });
  }

  if (!isPresent(project.thumbnailUrl)) {
    issues.push({
      id: "missing-thumbnail",
      label: "Add a thumbnail before publishing.",
      severity: "critical",
      field: "thumbnailUrl",
      blocksPublish: true,
    });
  }

  if (isPresent(project.thumbnailUrl) && !isPresent(project.thumbnailAltEs)) {
    issues.push({
      id: "missing-thumbnail-alt",
      label: "Thumbnail is missing Spanish alt text.",
      severity: "warning",
      field: "thumbnailAltEs",
    });
  }

  if (galleryItemsMissingAlt > 0) {
    issues.push({
      id: "gallery-alt-missing",
      label: `${galleryItemsMissingAlt} gallery image${galleryItemsMissingAlt === 1 ? "" : "s"} missing Spanish alt text.`,
      severity: "warning",
      field: "galleryItems",
    });
  }

  if (isPresent(project.canonicalUrl) && !isValidHttpUrl(project.canonicalUrl)) {
    issues.push({
      id: "invalid-canonical-url",
      label: "Canonical URL must start with http or https.",
      severity: "critical",
      field: "canonicalUrl",
      blocksSave: true,
      blocksPublish: true,
    });
  }

  if (isPresent(project.sourceUrl) && !isValidHttpUrl(project.sourceUrl)) {
    issues.push({
      id: "invalid-source-url",
      label: "Source URL must start with http or https.",
      severity: "critical",
      field: "sourceUrl",
      blocksSave: true,
      blocksPublish: true,
    });
  }

  if (project.featured && project.status !== "published") {
    issues.push({
      id: "featured-not-live",
      label: "Featured projects are not visible on the public site until they are published.",
      severity: "warning",
    });
  }

  return issues;
};

export const getAdminProjectSaveIssues = (project: AdminProject) =>
  getAdminProjectIssues(project).filter((issue) => issue.blocksSave);

export const getAdminProjectPublishIssues = (project: AdminProject) =>
  getAdminProjectIssues(project).filter((issue) => issue.blocksSave || issue.blocksPublish);

export const getAdminProjectWarnings = (project: AdminProject) =>
  getAdminProjectIssues(project).filter((issue) => issue.severity === "warning");

export const projectNeedsAttention = (project: AdminProject) =>
  getAdminProjectIssues(project).length > 0;

export const projectIsReadyToPublish = (project: AdminProject) =>
  project.status === "draft" && getAdminProjectPublishIssues(project).length === 0;

export const formatRelativeTimestamp = (value?: string) => {
  if (!value) {
    return "Unavailable";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const relativeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return relativeFormatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeFormatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) {
    return relativeFormatter.format(diffDays, "day");
  }

  return formatSyncTimestamp(value);
};

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
