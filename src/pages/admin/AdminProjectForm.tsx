import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowDown, ArrowUp, ExternalLink, ImagePlus, Trash2, UploadCloud } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { apiJson } from "@/lib/api";
import {
  categoryLabels,
  emptyAdminProject,
  formatSyncTimestamp,
  getProjectPreviewHref,
  normalizeAdminProject,
  statusBadgeClassNames,
  statusLabels,
  uploadFolderForProject,
} from "@/lib/admin/projects";
import { uploadAdminImage } from "@/lib/admin/uploads";
import type { AdminProject, AdminProjectApiResponse, ProjectGalleryItem } from "@/types/project";

const AdminProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const [project, setProject] = useState<AdminProject>(emptyAdminProject);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const galleryUploadRef = useRef<HTMLInputElement | null>(null);
  const thumbnailUploadRef = useRef<HTMLInputElement | null>(null);
  const backgroundUploadRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isNew || !id) {
      return;
    }

    let active = true;
    const loadProject = async () => {
      setIsLoading(true);
      try {
        const payload = await apiJson<AdminProjectApiResponse>(`/api/admin/project?id=${id}`);
        if (!active) {
          return;
        }
        setProject(normalizeAdminProject(payload.project));
        setError(null);
      } catch (caughtError) {
        if (!active) {
          return;
        }
        setError(caughtError instanceof Error ? caughtError.message : "Failed to load project.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadProject();
    return () => {
      active = false;
    };
  }, [id, isNew]);

  const projectTitle = useMemo(
    () => (isNew ? "New Project" : project.titleEs || "Edit Project"),
    [isNew, project.titleEs],
  );
  const previewHref = useMemo(
    () => getProjectPreviewHref({ slugEs: project.slugEs }),
    [project.slugEs],
  );
  const galleryItems = project.galleryItems || project.gallery || [];

  const setField = <K extends keyof AdminProject>(key: K, value: AdminProject[K]) => {
    setProject((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const syncGallery = (gallery: ProjectGalleryItem[]) => {
    setProject((current) => ({
      ...current,
      gallery,
      galleryItems: gallery,
    }));
  };

  const handleImageUpload = async (
    file: File,
    field: "thumbnailUrl" | "backgroundUrl",
  ) => {
    setUploadingField(field);
    setError(null);
    try {
      const upload = await uploadAdminImage(file, uploadFolderForProject(project));
      setField(field, upload.url as AdminProject[typeof field]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Upload failed.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    setUploadingField("gallery");
    setError(null);

    try {
      const uploads = await Promise.all(
        Array.from(files).map((file) => uploadAdminImage(file, uploadFolderForProject(project))),
      );
      const nextGallery = [
        ...galleryItems,
        ...uploads.map((upload, index) => ({
          id: window.crypto.randomUUID(),
          imageUrl: upload.url,
          position: galleryItems.length + index,
        })),
      ].map((item, index) => ({
        ...item,
        position: index,
      }));
      syncGallery(nextGallery);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Gallery upload failed.");
    } finally {
      setUploadingField(null);
    }
  };

  const moveGalleryItem = (index: number, direction: -1 | 1) => {
    const items = [...galleryItems];
    const target = index + direction;
    if (target < 0 || target >= items.length) {
      return;
    }

    [items[index], items[target]] = [items[target], items[index]];
    syncGallery(items.map((item, position) => ({ ...item, position })));
  };

  const removeGalleryItem = (index: number) => {
    const items = [...galleryItems];
    items.splice(index, 1);
    syncGallery(items.map((item, position) => ({ ...item, position })));
  };

  const updateGalleryItem = <K extends keyof ProjectGalleryItem>(
    index: number,
    key: K,
    value: ProjectGalleryItem[K],
  ) => {
    const items = [...galleryItems];
    items[index] = {
      ...items[index],
      [key]: value,
    };
    syncGallery(items);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        ...project,
        galleryItems: galleryItems.map((item, index) => ({
          ...item,
          position: index,
        })),
      };

      const response = isNew
        ? await apiJson<AdminProjectApiResponse>("/api/admin/projects", {
            method: "POST",
            body: JSON.stringify(payload),
          })
        : await apiJson<AdminProjectApiResponse>(`/api/admin/project?id=${project.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });

      const nextProject = normalizeAdminProject(response.project);
      setProject(nextProject);

      if (isNew && nextProject.id) {
        navigate(`/admin/projects/${nextProject.id}`, { replace: true });
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to save project.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!project.id || !window.confirm("Delete this project? This cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      await apiJson<{ ok: boolean }>(`/api/admin/project?id=${project.id}`, {
        method: "DELETE",
        body: JSON.stringify({}),
      });
      navigate("/admin/projects", { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to delete project.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminShell title="Project" subtitle="Loading project details from runtime storage.">
        <div className="rounded-3xl border border-border/50 bg-card/80 p-8 font-body text-sm text-muted-foreground shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
          Loading project...
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={projectTitle}
      subtitle="Edit titles, localized slugs, credits, media and gallery assets. Saves go through Vercel Functions and runtime storage."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-3xl border border-border/50 bg-card/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 font-body text-[10px] uppercase tracking-[0.22em] ${statusBadgeClassNames[project.status]}`}
                >
                  {statusLabels[project.status]}
                </span>
                <span className="rounded-full border border-border/60 bg-secondary/30 px-2.5 py-1 font-body text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {categoryLabels[project.category]}
                </span>
                {project.featured ? (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-body text-[10px] uppercase tracking-[0.22em] text-primary">
                    Featured
                  </span>
                ) : null}
              </div>
              <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground">
                Use this form to manage localized titles, media, stills, and publishing metadata.
                Files upload through the admin API and return public URLs immediately.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {previewHref ? (
                <Link
                  to={previewHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 font-body text-[10px] uppercase tracking-[0.24em] text-foreground"
                >
                  <ExternalLink size={14} />
                  <span>Preview</span>
                </Link>
              ) : null}
              <Link
                to="/admin/projects"
                className="rounded-full border border-border/60 px-4 py-2 font-body text-[10px] uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Back to Library
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-border/50 bg-card/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              <p className="font-body text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                Core
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Category</span>
                  <select
                    value={project.category}
                    onChange={(event) => setField("category", event.target.value as AdminProject["category"])}
                    className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm outline-none focus:border-primary"
                  >
                    <option value="publicidad">Advertising</option>
                    <option value="documental">Documentary</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Status</span>
                  <select
                    value={project.status}
                    onChange={(event) => setField("status", event.target.value as AdminProject["status"])}
                    className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm outline-none focus:border-primary"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Title ES</span>
                  <input
                    value={project.titleEs}
                    onChange={(event) => setField("titleEs", event.target.value)}
                    className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm outline-none focus:border-primary"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Title EN</span>
                  <input
                    value={project.titleEn || ""}
                    onChange={(event) => setField("titleEn", event.target.value)}
                    className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Slug ES</span>
                  <input
                    value={project.slugEs}
                    onChange={(event) => setField("slugEs", event.target.value)}
                    className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm outline-none focus:border-primary"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Slug EN</span>
                  <input
                    value={project.slugEn || ""}
                    onChange={(event) => setField("slugEn", event.target.value)}
                    className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm outline-none focus:border-primary"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-border/50 bg-card/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              <p className="font-body text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                Credits & Media
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  ["client", "Client"],
                  ["productora", "Producer"],
                  ["director", "Director"],
                  ["dop", "DOP"],
                ].map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{label}</span>
                    <input
                      value={String(project[key as keyof AdminProject] || "")}
                      onChange={(event) => setField(key as keyof AdminProject, event.target.value as never)}
                      className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm outline-none focus:border-primary"
                    />
                  </label>
                ))}
                <label className="block">
                  <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Media Type</span>
                  <select
                    value={project.mediaType || ""}
                    onChange={(event) => setField("mediaType", (event.target.value || undefined) as never)}
                    className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm outline-none focus:border-primary"
                  >
                    <option value="">None</option>
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Media Provider</span>
                  <input
                    value={project.mediaProvider || ""}
                    onChange={(event) => setField("mediaProvider", event.target.value)}
                    className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm outline-none focus:border-primary"
                    placeholder="vimeo, youtube, image"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Video URL</span>
                  <input
                    value={project.videoUrl || ""}
                    onChange={(event) => setField("videoUrl", event.target.value)}
                    className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm outline-none focus:border-primary"
                    placeholder="https://player.vimeo.com/video/..."
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Credits Text</span>
                  <textarea
                    value={project.creditsText || ""}
                    onChange={(event) => setField("creditsText", event.target.value)}
                    className="min-h-32 w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm outline-none focus:border-primary"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-border/50 bg-card/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-body text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                    Gallery
                  </p>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    Add stills, reorder them, and fine-tune alt text.
                  </p>
                </div>
                <div>
                  <input
                    ref={galleryUploadRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => void handleGalleryUpload(event.target.files)}
                  />
                  <button
                    type="button"
                    onClick={() => galleryUploadRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-2xl border border-border/60 px-4 py-3 font-body text-xs uppercase tracking-[0.24em] text-foreground"
                  >
                    <ImagePlus size={15} />
                    <span>{uploadingField === "gallery" ? "Uploading..." : "Upload Images"}</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {galleryItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/60 px-4 py-8 text-center font-body text-sm text-muted-foreground">
                    No gallery items yet.
                  </div>
                ) : (
                  galleryItems.map((item, index) => (
                    <div
                      key={item.id || `${item.imageUrl}-${index}`}
                      className="grid gap-4 rounded-2xl border border-border/50 bg-secondary/20 p-4 lg:grid-cols-[180px_1fr_auto]"
                    >
                      <div className="overflow-hidden rounded-xl bg-secondary">
                        <img
                          src={item.imageUrl}
                          alt={item.altEs || `Gallery ${index + 1}`}
                          className="aspect-[16/10] w-full object-cover"
                        />
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block">
                          <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Alt ES</span>
                          <input
                            value={item.altEs || ""}
                            onChange={(event) => updateGalleryItem(index, "altEs", event.target.value)}
                            className="w-full rounded-xl border border-border/60 bg-background/40 px-3 py-2 font-body text-sm outline-none focus:border-primary"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Alt EN</span>
                          <input
                            value={item.altEn || ""}
                            onChange={(event) => updateGalleryItem(index, "altEn", event.target.value)}
                            className="w-full rounded-xl border border-border/60 bg-background/40 px-3 py-2 font-body text-sm outline-none focus:border-primary"
                          />
                        </label>
                        <label className="block md:col-span-2">
                          <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Image URL</span>
                          <input
                            value={item.imageUrl}
                            onChange={(event) => updateGalleryItem(index, "imageUrl", event.target.value)}
                            className="w-full rounded-xl border border-border/60 bg-background/40 px-3 py-2 font-body text-sm outline-none focus:border-primary"
                          />
                        </label>
                      </div>
                      <div className="flex flex-row gap-2 lg:flex-col">
                        <button
                          type="button"
                          onClick={() => moveGalleryItem(index, -1)}
                          className="rounded-full border border-border/60 p-2 text-muted-foreground hover:text-foreground"
                        >
                          <ArrowUp size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveGalleryItem(index, 1)}
                          className="rounded-full border border-border/60 p-2 text-muted-foreground hover:text-foreground"
                        >
                          <ArrowDown size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeGalleryItem(index)}
                          className="rounded-full border border-destructive/40 p-2 text-destructive"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-border/50 bg-card/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-body text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Assets</p>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    Upload optimized images or paste URLs directly.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                {[
                  {
                    key: "thumbnailUrl" as const,
                    label: "Thumbnail",
                    inputRef: thumbnailUploadRef,
                  },
                  {
                    key: "backgroundUrl" as const,
                    label: "Background",
                    inputRef: backgroundUploadRef,
                  },
                ].map((asset) => (
                  <div key={asset.key} className="rounded-2xl border border-border/50 bg-secondary/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                          {asset.label}
                        </p>
                      </div>
                      <input
                        ref={asset.inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            void handleImageUpload(file, asset.key);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => asset.inputRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-2 font-body text-[10px] uppercase tracking-[0.24em] text-foreground"
                      >
                        <UploadCloud size={14} />
                        <span>
                          {uploadingField === asset.key ? "Uploading..." : "Upload"}
                        </span>
                      </button>
                    </div>

                    <input
                      value={String(project[asset.key] || "")}
                      onChange={(event) => setField(asset.key, event.target.value as never)}
                      className="mt-4 w-full rounded-xl border border-border/60 bg-background/40 px-3 py-2 font-body text-sm outline-none focus:border-primary"
                    />

                    {project[asset.key] ? (
                      <img
                        src={String(project[asset.key])}
                        alt={asset.label}
                        className="mt-4 aspect-[16/10] w-full rounded-xl object-cover"
                      />
                    ) : null}
                  </div>
                ))}

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                      Thumbnail Alt ES
                    </span>
                    <input
                      value={project.thumbnailAltEs || ""}
                      onChange={(event) => setField("thumbnailAltEs", event.target.value)}
                      className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                      Thumbnail Alt EN
                    </span>
                    <input
                      value={project.thumbnailAltEn || ""}
                      onChange={(event) => setField("thumbnailAltEn", event.target.value)}
                      className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                      Thumbnail Aspect Ratio
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={project.thumbnailAspectRatio ?? ""}
                      onChange={(event) =>
                        setField(
                          "thumbnailAspectRatio",
                          event.target.value === "" ? undefined : Number(event.target.value),
                        )
                      }
                      className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                      Gallery Aspect Ratio
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={project.galleryAspectRatio ?? ""}
                      onChange={(event) =>
                        setField(
                          "galleryAspectRatio",
                          event.target.value === "" ? undefined : Number(event.target.value),
                        )
                      }
                      className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm outline-none focus:border-primary"
                    />
                  </label>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-border/50 bg-card/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              <p className="font-body text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                Publishing
              </p>
              <div className="mt-5 grid gap-4">
                <label className="flex items-center gap-3 rounded-2xl border border-border/60 bg-secondary/20 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={project.featured}
                    onChange={(event) => setField("featured", event.target.checked)}
                  />
                  <span className="font-body text-sm text-foreground">Featured project</span>
                </label>
                <label className="block">
                  <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Sort Order</span>
                  <input
                    type="number"
                    value={project.sortOrder}
                    onChange={(event) => setField("sortOrder", Number(event.target.value))}
                    className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Canonical URL</span>
                  <input
                    value={project.canonicalUrl || ""}
                    onChange={(event) => setField("canonicalUrl", event.target.value)}
                    className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Source URL</span>
                  <input
                    value={project.sourceUrl || ""}
                    onChange={(event) => setField("sourceUrl", event.target.value)}
                    className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm outline-none focus:border-primary"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-border/50 bg-card/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              <p className="font-body text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                Metadata
              </p>
              <div className="mt-5 space-y-3">
                {[
                  ["ID", project.id || "Generated after first save"],
                  ["Created", formatSyncTimestamp(project.createdAt)],
                  ["Updated", formatSyncTimestamp(project.updatedAt)],
                  ["Published", formatSyncTimestamp(project.publishedAt)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-secondary/20 px-4 py-3"
                  >
                    <span className="font-body text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                      {label}
                    </span>
                    <span className="font-body text-sm text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {error ? (
          <div className="rounded-3xl border border-destructive/40 bg-destructive/10 px-5 py-4 font-body text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-2xl bg-primary px-5 py-3 font-body text-xs uppercase tracking-[0.28em] text-primary-foreground disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Project"}
          </button>
          <Link
            to="/admin/projects"
            className="rounded-2xl border border-border/60 px-5 py-3 font-body text-xs uppercase tracking-[0.28em] text-foreground"
          >
            Back to Projects
          </Link>
          {!isNew ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-2xl border border-destructive/40 px-5 py-3 font-body text-xs uppercase tracking-[0.28em] text-destructive disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </button>
          ) : null}
        </div>
      </form>
    </AdminShell>
  );
};

export default AdminProjectForm;
