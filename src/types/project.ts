import type { Lang } from "./language";
export type { Lang };

export type ProjectCategory = "publicidad" | "documental";
export type ProjectStatus = "draft" | "published" | "archived";
export type ProjectMediaType = "video" | "image";

export type ProjectGalleryItem = {
  id?: string;
  imageUrl: string;
  altEs?: string;
  altEn?: string;
  aspectRatio?: number;
  position?: number;
};

export type Project = {
  id?: string;
  slug: string;
  slugEn?: string;
  title: string;
  titleEn?: string;
  category: ProjectCategory;
  client?: string;
  productora?: string;
  director?: string;
  dop?: string;
  videoUrl?: string;
  mediaType?: ProjectMediaType;
  mediaProvider?: string;
  featured?: boolean;
  gallery?: string[];
  galleryItems?: ProjectGalleryItem[];
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  thumbnailAltEn?: string;
  thumbnailAspectRatio?: number;
  galleryAspectRatio?: number;
  backgroundUrl?: string;
  canonicalUrl?: string;
  sourceUrl?: string;
  creditsText?: string;
  status?: ProjectStatus;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
};

export type AdminProject = {
  id: string;
  category: ProjectCategory;
  status: ProjectStatus;
  slugEs: string;
  slugEn?: string;
  titleEs: string;
  titleEn?: string;
  client?: string;
  productora?: string;
  director?: string;
  dop?: string;
  mediaType?: ProjectMediaType;
  mediaProvider?: string;
  videoUrl?: string;
  featured: boolean;
  sortOrder: number;
  thumbnailUrl?: string;
  thumbnailAltEs?: string;
  thumbnailAltEn?: string;
  thumbnailAspectRatio?: number;
  backgroundUrl?: string;
  galleryAspectRatio?: number;
  canonicalUrl?: string;
  sourceUrl?: string;
  creditsText?: string;
  gallery?: ProjectGalleryItem[];
  galleryItems: ProjectGalleryItem[];
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
};

export type AdminProjectInput = Omit<
  AdminProject,
  "id" | "createdAt" | "updatedAt" | "publishedAt" | "gallery"
>;

export type ProjectsApiResponse = {
  projects: Project[];
  source: "database" | "file" | "static";
  syncedAt: string;
};

export type ProjectsResponse = ProjectsApiResponse;

export type ProjectApiResponse = {
  project: Project | null;
  source: "database" | "file" | "static";
  syncedAt: string;
};

export type ProjectResponse = ProjectApiResponse;

export type AdminProjectsApiResponse = {
  projects: AdminProject[];
  source: "database" | "file" | "static";
  syncedAt: string;
};

export type AdminProjectApiResponse = {
  project: AdminProject | null;
  source: "database" | "file" | "static";
  syncedAt: string;
};

export type AdminSession = {
  authenticated: boolean;
  email?: string;
  expiresAt?: string;
};

export type AdminSessionResponse = {
  session: AdminSession;
};

export type UploadResponse = {
  url: string;
  pathname?: string;
  contentType?: string;
  size?: number;
  source?: "blob" | "local";
};

export type PublicProjectsContextValue = {
  projects: Project[];
  source: ProjectsApiResponse["source"];
  isLoading: boolean;
  error: string | null;
  sharedThumbnailAspectRatio: number;
  getProjectsByCategory: (category: ProjectCategory) => Project[];
  getProjectBySlug: (slug: string) => Project | undefined;
  getProjectByLocalizedSlug: (slug: string, lang: Lang) => Project | undefined;
  refetch: () => Promise<void>;
};
