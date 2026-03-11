import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { ConflictError, NotFoundError } from "./errors";
import type {
  AdminProject,
  AdminProjectInput,
  Lang,
  Project,
  ProjectCategory,
  ProjectGalleryItem,
} from "../../src/types/project";
import { buildStaticProjects } from "./static-projects";

type StoreSource = "database" | "file";

type StoreResult<T> = {
  data: T;
  source: StoreSource;
  syncedAt: string;
};

type FileStorePayload = {
  projects: AdminProject[];
  syncedAt: string;
};

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const FILE_STORE_PATH = path.join(PROJECT_ROOT, ".data", "admin-projects.json");
const STATIC_PROJECTS = buildStaticProjects();
let databaseClient: ReturnType<typeof postgres> | null = null;
let databaseReadyPromise: Promise<void> | null = null;

const sortProjects = <T extends { featured?: boolean; sortOrder?: number; title?: string; titleEs?: string }>(
  items: T[],
) =>
  [...items].sort((left, right) => {
    const featuredDelta = Number(Boolean(right.featured)) - Number(Boolean(left.featured));
    if (featuredDelta !== 0) {
      return featuredDelta;
    }

    const sortDelta = (left.sortOrder ?? Number.MAX_SAFE_INTEGER) - (right.sortOrder ?? Number.MAX_SAFE_INTEGER);
    if (sortDelta !== 0) {
      return sortDelta;
    }

    return (left.title ?? left.titleEs ?? "").localeCompare(
      right.title ?? right.titleEs ?? "",
      "es",
      {
        sensitivity: "base",
        numeric: true,
      },
    );
  });

const getSyncedAt = () => new Date().toISOString();

const toGalleryItems = (
  project: Project,
): ProjectGalleryItem[] =>
  (project.gallery ?? []).map((imageUrl, index) => ({
    id: randomUUID(),
    imageUrl,
    altEs: project.thumbnailAlt,
    altEn: project.thumbnailAltEn ?? project.thumbnailAlt,
    aspectRatio: project.galleryAspectRatio,
    position: index,
  }));

const buildSeedProjects = (): AdminProject[] => {
  const sortCounters: Record<ProjectCategory, number> = {
    publicidad: 0,
    documental: 0,
  };
  const timestamp = getSyncedAt();

  return STATIC_PROJECTS.map((project) => {
    const currentSortOrder = sortCounters[project.category];
    sortCounters[project.category] += 1;

    return {
      id: randomUUID(),
      category: project.category,
      status: "published",
      slugEs: project.slug,
      slugEn: project.slugEn,
      titleEs: project.title,
      titleEn: project.titleEn ?? project.title,
      client: project.client,
      productora: project.productora,
      director: project.director,
      dop: project.dop,
      mediaType: project.mediaType,
      mediaProvider: project.mediaProvider,
      videoUrl: project.videoUrl,
      featured: Boolean(project.featured),
      sortOrder: currentSortOrder,
      thumbnailUrl: project.thumbnailUrl,
      thumbnailAltEs: project.thumbnailAlt,
      thumbnailAltEn: project.thumbnailAltEn ?? project.thumbnailAlt,
      thumbnailAspectRatio: project.thumbnailAspectRatio,
      backgroundUrl: project.backgroundUrl,
      galleryAspectRatio: project.galleryAspectRatio,
      canonicalUrl: project.canonicalUrl,
      sourceUrl: project.sourceUrl,
      creditsText: project.creditsText,
      galleryItems: toGalleryItems(project),
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: timestamp,
    };
  });
};

const buildSeedPayload = (): FileStorePayload => ({
  projects: sortProjects(buildSeedProjects()),
  syncedAt: getSyncedAt(),
});

const toPublicProject = (project: AdminProject, lang: Lang): Project => ({
  id: project.id,
  slug: project.slugEs,
  slugEn: project.slugEn,
  title: lang === "en" ? project.titleEn || project.titleEs : project.titleEs,
  titleEn: project.titleEn,
  category: project.category,
  client: project.client,
  productora: project.productora,
  director: project.director,
  dop: project.dop,
  videoUrl: project.videoUrl,
  mediaType: project.mediaType,
  mediaProvider: project.mediaProvider,
  featured: project.featured,
  gallery: project.galleryItems
    .sort((left, right) => (left.position ?? 0) - (right.position ?? 0))
    .map((item) => item.imageUrl),
  galleryItems: project.galleryItems,
  thumbnailUrl: project.thumbnailUrl,
  thumbnailAlt: lang === "en" ? project.thumbnailAltEn || project.thumbnailAltEs : project.thumbnailAltEs,
  thumbnailAltEn: project.thumbnailAltEn,
  thumbnailAspectRatio: project.thumbnailAspectRatio,
  galleryAspectRatio: project.galleryAspectRatio,
  backgroundUrl: project.backgroundUrl,
  canonicalUrl: project.canonicalUrl,
  sourceUrl: project.sourceUrl,
  creditsText: project.creditsText,
  status: project.status,
  sortOrder: project.sortOrder,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
  publishedAt: project.publishedAt,
});

const normalizeGalleryItems = (items: ProjectGalleryItem[]) =>
  items
    .map((item, index) => ({
      id: item.id || randomUUID(),
      imageUrl: item.imageUrl,
      altEs: item.altEs,
      altEn: item.altEn,
      aspectRatio: item.aspectRatio,
      position: item.position ?? index,
    }))
    .sort((left, right) => (left.position ?? 0) - (right.position ?? 0))
    .map((item, index) => ({
      ...item,
      position: index,
    }));

const toStoredProject = (
  input: AdminProjectInput,
  existing?: AdminProject,
): AdminProject => {
  const timestamp = getSyncedAt();
  const publishedAt =
    input.status === "published"
      ? existing?.publishedAt || timestamp
      : input.status === "archived"
        ? existing?.publishedAt
        : undefined;

  return {
    id: existing?.id || randomUUID(),
    category: input.category,
    status: input.status,
    slugEs: input.slugEs,
    slugEn: input.slugEn,
    titleEs: input.titleEs,
    titleEn: input.titleEn,
    client: input.client,
    productora: input.productora,
    director: input.director,
    dop: input.dop,
    mediaType: input.mediaType,
    mediaProvider: input.mediaProvider,
    videoUrl: input.videoUrl,
    featured: input.featured,
    sortOrder: input.sortOrder,
    thumbnailUrl: input.thumbnailUrl,
    thumbnailAltEs: input.thumbnailAltEs,
    thumbnailAltEn: input.thumbnailAltEn,
    thumbnailAspectRatio: input.thumbnailAspectRatio,
    backgroundUrl: input.backgroundUrl,
    galleryAspectRatio: input.galleryAspectRatio,
    canonicalUrl: input.canonicalUrl,
    sourceUrl: input.sourceUrl,
    creditsText: input.creditsText,
    galleryItems: normalizeGalleryItems(input.galleryItems),
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
    publishedAt,
  };
};

const readJsonFileStore = async (): Promise<FileStorePayload> => {
  try {
    const content = await readFile(FILE_STORE_PATH, "utf8");
    return JSON.parse(content) as FileStorePayload;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    const initial = buildSeedPayload();
    await writeJsonFileStore(initial);
    return initial;
  }
};

const writeJsonFileStore = async (payload: FileStorePayload) => {
  await mkdir(path.dirname(FILE_STORE_PATH), { recursive: true });
  await writeFile(FILE_STORE_PATH, JSON.stringify(payload, null, 2));
};

const fileStore = {
  async listAdminProjects(): Promise<StoreResult<AdminProject[]>> {
    const payload = await readJsonFileStore();
    return {
      data: sortProjects(payload.projects),
      source: "file",
      syncedAt: payload.syncedAt,
    };
  },

  async getAdminProject(id: string): Promise<StoreResult<AdminProject | null>> {
    const payload = await readJsonFileStore();
    return {
      data: payload.projects.find((project) => project.id === id) || null,
      source: "file",
      syncedAt: payload.syncedAt,
    };
  },

  async saveAdminProject(
    input: AdminProjectInput,
    id?: string,
  ): Promise<StoreResult<AdminProject>> {
    const payload = await readJsonFileStore();
    const existing = id ? payload.projects.find((project) => project.id === id) : undefined;

    if (id && !existing) {
      throw new NotFoundError("Project not found");
    }

    const duplicate = payload.projects.find((project) => {
      if (existing && project.id === existing.id) {
        return false;
      }
      return project.slugEs === input.slugEs || (input.slugEn && project.slugEn === input.slugEn);
    });

    if (duplicate) {
      throw new ConflictError("Slug already exists");
    }

    const nextProject = toStoredProject(input, existing);
    const nextProjects = existing
      ? payload.projects.map((project) => (project.id === existing.id ? nextProject : project))
      : [...payload.projects, nextProject];

    const nextPayload = {
      projects: sortProjects(nextProjects),
      syncedAt: getSyncedAt(),
    };

    await writeJsonFileStore(nextPayload);
    return {
      data: nextProject,
      source: "file",
      syncedAt: nextPayload.syncedAt,
    };
  },

  async deleteAdminProject(id: string): Promise<StoreResult<boolean>> {
    const payload = await readJsonFileStore();
    const nextProjects = payload.projects.filter((project) => project.id !== id);
    const deleted = nextProjects.length !== payload.projects.length;
    const nextPayload = {
      projects: nextProjects,
      syncedAt: getSyncedAt(),
    };
    await writeJsonFileStore(nextPayload);

    return {
      data: deleted,
      source: "file",
      syncedAt: nextPayload.syncedAt,
    };
  },

  async seedAdminProjects(reset = false): Promise<StoreResult<AdminProject[]>> {
    if (!reset) {
      return this.listAdminProjects();
    }

    const payload = buildSeedPayload();
    await writeJsonFileStore(payload);

    return {
      data: payload.projects,
      source: "file",
      syncedAt: payload.syncedAt,
    };
  },
};

const getDatabaseClient = () => {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!databaseClient) {
    databaseClient = postgres(process.env.DATABASE_URL, {
      prepare: false,
    });
  }

  return databaseClient;
};

const mapDatabaseRow = (row: Record<string, unknown>): AdminProject => ({
  id: String(row.id),
  category: row.category as AdminProject["category"],
  status: row.status as AdminProject["status"],
  slugEs: String(row.slug_es),
  slugEn: row.slug_en ? String(row.slug_en) : undefined,
  titleEs: String(row.title_es),
  titleEn: row.title_en ? String(row.title_en) : undefined,
  client: row.client ? String(row.client) : undefined,
  productora: row.productora ? String(row.productora) : undefined,
  director: row.director ? String(row.director) : undefined,
  dop: row.dop ? String(row.dop) : undefined,
  mediaType: row.media_type ? (String(row.media_type) as AdminProject["mediaType"]) : undefined,
  mediaProvider: row.media_provider ? String(row.media_provider) : undefined,
  videoUrl: row.video_url ? String(row.video_url) : undefined,
  featured: Boolean(row.featured),
  sortOrder: Number(row.sort_order || 0),
  thumbnailUrl: row.thumbnail_url ? String(row.thumbnail_url) : undefined,
  thumbnailAltEs: row.thumbnail_alt_es ? String(row.thumbnail_alt_es) : undefined,
  thumbnailAltEn: row.thumbnail_alt_en ? String(row.thumbnail_alt_en) : undefined,
  thumbnailAspectRatio: row.thumbnail_aspect_ratio ? Number(row.thumbnail_aspect_ratio) : undefined,
  backgroundUrl: row.background_url ? String(row.background_url) : undefined,
  galleryAspectRatio: row.gallery_aspect_ratio ? Number(row.gallery_aspect_ratio) : undefined,
  canonicalUrl: row.canonical_url ? String(row.canonical_url) : undefined,
  sourceUrl: row.source_url ? String(row.source_url) : undefined,
  creditsText: row.credits_text ? String(row.credits_text) : undefined,
  galleryItems: normalizeGalleryItems(
    Array.isArray(row.gallery_items)
      ? (row.gallery_items as ProjectGalleryItem[])
      : [],
  ),
  createdAt: row.created_at ? new Date(String(row.created_at)).toISOString() : undefined,
  updatedAt: row.updated_at ? new Date(String(row.updated_at)).toISOString() : undefined,
  publishedAt: row.published_at ? new Date(String(row.published_at)).toISOString() : undefined,
});

const insertProjects = async (
  sql: NonNullable<ReturnType<typeof getDatabaseClient>>,
  projects: AdminProject[],
) => {
  for (const project of projects) {
    await sql`
      INSERT INTO projects (
        id,
        category,
        status,
        slug_es,
        slug_en,
        title_es,
        title_en,
        client,
        productora,
        director,
        dop,
        media_type,
        media_provider,
        video_url,
        featured,
        sort_order,
        thumbnail_url,
        thumbnail_alt_es,
        thumbnail_alt_en,
        thumbnail_aspect_ratio,
        background_url,
        gallery_aspect_ratio,
        canonical_url,
        source_url,
        credits_text,
        gallery_items,
        created_at,
        updated_at,
        published_at
      ) VALUES (
        ${project.id},
        ${project.category},
        ${project.status},
        ${project.slugEs},
        ${project.slugEn ?? null},
        ${project.titleEs},
        ${project.titleEn ?? null},
        ${project.client ?? null},
        ${project.productora ?? null},
        ${project.director ?? null},
        ${project.dop ?? null},
        ${project.mediaType ?? null},
        ${project.mediaProvider ?? null},
        ${project.videoUrl ?? null},
        ${project.featured},
        ${project.sortOrder},
        ${project.thumbnailUrl ?? null},
        ${project.thumbnailAltEs ?? null},
        ${project.thumbnailAltEn ?? null},
        ${project.thumbnailAspectRatio ?? null},
        ${project.backgroundUrl ?? null},
        ${project.galleryAspectRatio ?? null},
        ${project.canonicalUrl ?? null},
        ${project.sourceUrl ?? null},
        ${project.creditsText ?? null},
        ${JSON.stringify(project.galleryItems)}::jsonb,
        ${project.createdAt ?? getSyncedAt()},
        ${project.updatedAt ?? getSyncedAt()},
        ${project.publishedAt ?? null}
      )
    `;
  }
};

const ensureDatabaseReady = async () => {
  const sql = getDatabaseClient();
  if (!sql) {
    return;
  }

  if (!databaseReadyPromise) {
    databaseReadyPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          category TEXT NOT NULL,
          status TEXT NOT NULL,
          slug_es TEXT NOT NULL UNIQUE,
          slug_en TEXT UNIQUE,
          title_es TEXT NOT NULL,
          title_en TEXT,
          client TEXT,
          productora TEXT,
          director TEXT,
          dop TEXT,
          media_type TEXT,
          media_provider TEXT,
          video_url TEXT,
          featured BOOLEAN NOT NULL DEFAULT FALSE,
          sort_order INTEGER NOT NULL DEFAULT 0,
          thumbnail_url TEXT,
          thumbnail_alt_es TEXT,
          thumbnail_alt_en TEXT,
          thumbnail_aspect_ratio DOUBLE PRECISION,
          background_url TEXT,
          gallery_aspect_ratio DOUBLE PRECISION,
          canonical_url TEXT,
          source_url TEXT,
          credits_text TEXT,
          gallery_items JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          published_at TIMESTAMPTZ
        )
      `;

      const result = await sql<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM projects`;
      if (Number(result[0]?.count || 0) > 0) {
        return;
      }

      await insertProjects(sql, buildSeedProjects());
    })();
  }

  await databaseReadyPromise;
};

const databaseStore = {
  async listAdminProjects(): Promise<StoreResult<AdminProject[]>> {
    const sql = getDatabaseClient();
    if (!sql) {
      throw new Error("Database not configured");
    }
    await ensureDatabaseReady();
    const rows = await sql<Record<string, unknown>[]>`
      SELECT *
      FROM projects
      ORDER BY featured DESC, sort_order ASC, title_es ASC
    `;

    return {
      data: rows.map(mapDatabaseRow),
      source: "database",
      syncedAt: getSyncedAt(),
    };
  },

  async getAdminProject(id: string): Promise<StoreResult<AdminProject | null>> {
    const sql = getDatabaseClient();
    if (!sql) {
      throw new Error("Database not configured");
    }
    await ensureDatabaseReady();
    const rows = await sql<Record<string, unknown>[]>`
      SELECT *
      FROM projects
      WHERE id = ${id}
      LIMIT 1
    `;

    return {
      data: rows[0] ? mapDatabaseRow(rows[0]) : null,
      source: "database",
      syncedAt: getSyncedAt(),
    };
  },

  async saveAdminProject(
    input: AdminProjectInput,
    id?: string,
  ): Promise<StoreResult<AdminProject>> {
    const sql = getDatabaseClient();
    if (!sql) {
      throw new Error("Database not configured");
    }
    await ensureDatabaseReady();
    const existing = id ? (await this.getAdminProject(id)).data : null;
    if (id && !existing) {
      throw new NotFoundError("Project not found");
    }
    const next = toStoredProject(input, existing || undefined);

    const duplicateRows = await sql<Record<string, unknown>[]>`
      SELECT id
      FROM projects
      WHERE (
        slug_es = ${next.slugEs}
        OR (${next.slugEn ?? null} IS NOT NULL AND slug_en = ${next.slugEn ?? null})
      )
      AND id <> ${next.id}
      LIMIT 1
    `;

    if (duplicateRows.length > 0) {
      throw new ConflictError("Slug already exists");
    }

    await sql`
      INSERT INTO projects (
        id,
        category,
        status,
        slug_es,
        slug_en,
        title_es,
        title_en,
        client,
        productora,
        director,
        dop,
        media_type,
        media_provider,
        video_url,
        featured,
        sort_order,
        thumbnail_url,
        thumbnail_alt_es,
        thumbnail_alt_en,
        thumbnail_aspect_ratio,
        background_url,
        gallery_aspect_ratio,
        canonical_url,
        source_url,
        credits_text,
        gallery_items,
        created_at,
        updated_at,
        published_at
      ) VALUES (
        ${next.id},
        ${next.category},
        ${next.status},
        ${next.slugEs},
        ${next.slugEn ?? null},
        ${next.titleEs},
        ${next.titleEn ?? null},
        ${next.client ?? null},
        ${next.productora ?? null},
        ${next.director ?? null},
        ${next.dop ?? null},
        ${next.mediaType ?? null},
        ${next.mediaProvider ?? null},
        ${next.videoUrl ?? null},
        ${next.featured},
        ${next.sortOrder},
        ${next.thumbnailUrl ?? null},
        ${next.thumbnailAltEs ?? null},
        ${next.thumbnailAltEn ?? null},
        ${next.thumbnailAspectRatio ?? null},
        ${next.backgroundUrl ?? null},
        ${next.galleryAspectRatio ?? null},
        ${next.canonicalUrl ?? null},
        ${next.sourceUrl ?? null},
        ${next.creditsText ?? null},
        ${JSON.stringify(next.galleryItems)}::jsonb,
        ${next.createdAt ?? getSyncedAt()},
        ${next.updatedAt ?? getSyncedAt()},
        ${next.publishedAt ?? null}
      )
      ON CONFLICT (id) DO UPDATE SET
        category = EXCLUDED.category,
        status = EXCLUDED.status,
        slug_es = EXCLUDED.slug_es,
        slug_en = EXCLUDED.slug_en,
        title_es = EXCLUDED.title_es,
        title_en = EXCLUDED.title_en,
        client = EXCLUDED.client,
        productora = EXCLUDED.productora,
        director = EXCLUDED.director,
        dop = EXCLUDED.dop,
        media_type = EXCLUDED.media_type,
        media_provider = EXCLUDED.media_provider,
        video_url = EXCLUDED.video_url,
        featured = EXCLUDED.featured,
        sort_order = EXCLUDED.sort_order,
        thumbnail_url = EXCLUDED.thumbnail_url,
        thumbnail_alt_es = EXCLUDED.thumbnail_alt_es,
        thumbnail_alt_en = EXCLUDED.thumbnail_alt_en,
        thumbnail_aspect_ratio = EXCLUDED.thumbnail_aspect_ratio,
        background_url = EXCLUDED.background_url,
        gallery_aspect_ratio = EXCLUDED.gallery_aspect_ratio,
        canonical_url = EXCLUDED.canonical_url,
        source_url = EXCLUDED.source_url,
        credits_text = EXCLUDED.credits_text,
        gallery_items = EXCLUDED.gallery_items,
        updated_at = EXCLUDED.updated_at,
        published_at = EXCLUDED.published_at
    `;

    return {
      data: next,
      source: "database",
      syncedAt: getSyncedAt(),
    };
  },

  async deleteAdminProject(id: string): Promise<StoreResult<boolean>> {
    const sql = getDatabaseClient();
    if (!sql) {
      throw new Error("Database not configured");
    }
    await ensureDatabaseReady();
    const rows = await sql<{ id: string }[]>`
      DELETE FROM projects
      WHERE id = ${id}
      RETURNING id
    `;

    return {
      data: rows.length > 0,
      source: "database",
      syncedAt: getSyncedAt(),
    };
  },

  async seedAdminProjects(reset = false): Promise<StoreResult<AdminProject[]>> {
    const sql = getDatabaseClient();
    if (!sql) {
      throw new Error("Database not configured");
    }

    await ensureDatabaseReady();

    if (!reset) {
      return this.listAdminProjects();
    }

    await sql`TRUNCATE TABLE projects`;
    const seeds = buildSeedProjects();
    await insertProjects(sql, seeds);

    return {
      data: sortProjects(seeds),
      source: "database",
      syncedAt: getSyncedAt(),
    };
  },
};

const getStore = () => (process.env.DATABASE_URL ? databaseStore : fileStore);

export const listAdminProjects = async () => getStore().listAdminProjects();
export const getAdminProject = async (id: string) => getStore().getAdminProject(id);
export const saveAdminProject = async (input: AdminProjectInput, id?: string) =>
  getStore().saveAdminProject(input, id);
export const deleteAdminProject = async (id: string) => getStore().deleteAdminProject(id);
export const seedContentStore = async (reset = false) => getStore().seedAdminProjects(reset);

export const listPublicProjects = async (options: {
  category?: ProjectCategory;
  lang?: Lang;
  status?: "published";
} = {}): Promise<StoreResult<Project[]>> => {
  const { category, lang = "es" } = options;
  const adminProjects = await listAdminProjects();
  const filtered = adminProjects.data.filter((project) => {
    if (project.status !== "published") {
      return false;
    }

    if (category && project.category !== category) {
      return false;
    }

    return true;
  });

  return {
    data: sortProjects(filtered).map((project) => toPublicProject(project, lang)),
    source: adminProjects.source,
    syncedAt: adminProjects.syncedAt,
  };
};

export const getPublicProject = async (
  slug: string,
  lang: Lang = "es",
): Promise<StoreResult<Project | null>> => {
  const adminProjects = await listAdminProjects();
  const project = adminProjects.data.find((candidate) => {
    if (candidate.status !== "published") {
      return false;
    }

    return candidate.slugEs === slug || candidate.slugEn === slug;
  });

  return {
    data: project ? toPublicProject(project, lang) : null,
    source: adminProjects.source,
    syncedAt: adminProjects.syncedAt,
  };
};
