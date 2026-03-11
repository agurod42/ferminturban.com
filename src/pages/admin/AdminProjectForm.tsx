import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useBlocker, useBeforeUnload, useNavigate, useParams } from "react-router-dom";
import {
  Archive,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  GripVertical,
  ImagePlus,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
import AdminDialog from "@/components/admin/AdminDialog";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminSession } from "@/hooks/useAdminSession";
import { apiJson } from "@/lib/api";
import {
  categoryLabels,
  emptyAdminProject,
  formatRelativeTimestamp,
  formatSyncTimestamp,
  getAdminProjectIssues,
  getAdminProjectPublishIssues,
  getAdminProjectSaveIssues,
  getAdminProjectWarnings,
  getProjectPreviewHref,
  normalizeAdminProject,
  projectIsReadyToPublish,
  statusBadgeClassNames,
  statusLabels,
  toProjectInput,
  uploadFolderForProject,
  type AdminProjectFieldKey,
} from "@/lib/admin/projects";
import { uploadAdminImage } from "@/lib/admin/uploads";
import type { AdminProject, AdminProjectApiResponse, ProjectGalleryItem } from "@/types/project";

type SubmitIntent = "save" | "draft" | "publish" | "archive";
type DialogType = "publish" | "archive" | "delete" | "leave" | null;
type NoticeState =
  | {
      tone: "success" | "warning" | "info";
      message: string;
    }
  | null;
type FormErrors = Partial<Record<AdminProjectFieldKey, string>>;

const sectionLinks = [
  { id: "basics", label: "Basics" },
  { id: "media", label: "Media" },
  { id: "assets", label: "Assets" },
  { id: "gallery", label: "Gallery" },
  { id: "publishing", label: "Publishing" },
] as const;

const fieldBaseClass =
  "min-h-11 w-full rounded-2xl border px-4 py-3 font-body text-sm text-foreground outline-none transition-colors";
const textAreaBaseClass =
  "min-h-[140px] w-full rounded-2xl border px-4 py-3 font-body text-sm text-foreground outline-none transition-colors";

const getFieldClassName = (error?: string) =>
  `${fieldBaseClass} ${
    error
      ? "border-destructive/70 bg-destructive/5 focus:border-destructive"
      : "border-border/60 bg-secondary/20 focus:border-primary"
  }`;

const getTextAreaClassName = (error?: string) =>
  `${textAreaBaseClass} ${
    error
      ? "border-destructive/70 bg-destructive/5 focus:border-destructive"
      : "border-border/60 bg-secondary/20 focus:border-primary"
  }`;

const toIssueMap = (issues: ReturnType<typeof getAdminProjectSaveIssues>): FormErrors =>
  issues.reduce<FormErrors>((accumulator, issue) => {
    if (issue.field && !accumulator[issue.field]) {
      accumulator[issue.field] = issue.label;
    }

    return accumulator;
  }, {});

const FieldMessage = ({
  error,
  helper,
}: {
  error?: string;
  helper?: string;
}) => (
  <p className={`mt-2 font-body text-sm ${error ? "text-destructive" : "text-muted-foreground"}`}>
    {error || helper}
  </p>
);

const toPersistedSnapshot = (project: AdminProject) => JSON.stringify(toProjectInput(project));

const AdminProjectForm = () => {
  const navigate = useNavigate();
  const { session } = useAdminSession();
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const [project, setProject] = useState<AdminProject>(emptyAdminProject);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState(() => toPersistedSnapshot(emptyAdminProject));
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [validationMode, setValidationMode] = useState<"save" | "publish">("save");
  const [touchedFields, setTouchedFields] = useState<Partial<Record<AdminProjectFieldKey, boolean>>>({});
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [draggingGalleryIndex, setDraggingGalleryIndex] = useState<number | null>(null);
  const [hasUnsavedUploads, setHasUnsavedUploads] = useState(false);
  const galleryUploadRef = useRef<HTMLInputElement | null>(null);
  const thumbnailUploadRef = useRef<HTMLInputElement | null>(null);
  const backgroundUploadRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isNew || !id) {
      const initialProject = normalizeAdminProject(emptyAdminProject);
      setProject(initialProject);
      setSavedSnapshot(toPersistedSnapshot(initialProject));
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

        const nextProject = normalizeAdminProject(payload.project);
        setProject(nextProject);
        setSavedSnapshot(toPersistedSnapshot(nextProject));
        setTouchedFields({});
        setHasAttemptedSubmit(false);
        setHasUnsavedUploads(false);
        setError(null);
        setNotice(null);
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

  const currentSnapshot = useMemo(() => toPersistedSnapshot(project), [project]);
  const isDirty = currentSnapshot !== savedSnapshot;
  const previewHref = project.status === "published" ? getProjectPreviewHref({ slugEs: project.slugEs }) : null;
  const galleryItems = useMemo(
    () => project.galleryItems || project.gallery || [],
    [project.gallery, project.galleryItems],
  );
  const saveIssues = useMemo(() => getAdminProjectSaveIssues(project), [project]);
  const publishIssues = useMemo(() => getAdminProjectPublishIssues(project), [project]);
  const warnings = useMemo(() => getAdminProjectWarnings(project), [project]);
  const saveFieldErrors = useMemo(() => toIssueMap(saveIssues), [saveIssues]);
  const publishFieldErrors = useMemo(() => toIssueMap(publishIssues), [publishIssues]);
  const activeFieldErrors = validationMode === "publish" ? publishFieldErrors : saveFieldErrors;

  const readinessChecklist = useMemo(
    () => [
      {
        label: "Spanish title and slug",
        complete: Boolean(project.titleEs.trim()) && Boolean(project.slugEs.trim()),
      },
      {
        label: "Thumbnail selected",
        complete: Boolean(project.thumbnailUrl),
      },
      {
        label: "Primary media connected",
        complete: project.mediaType === "video" ? Boolean(project.videoUrl) : true,
      },
      {
        label: "Accessibility copy started",
        complete:
          Boolean(project.thumbnailAltEs) &&
          galleryItems.every((item) => Boolean(item.altEs && item.altEs.trim().length > 0)),
      },
      {
        label: "Publishing blockers cleared",
        complete: publishIssues.length === 0,
      },
    ],
    [galleryItems, project, publishIssues.length],
  );

  const completionRatio = readinessChecklist.filter((item) => item.complete).length / readinessChecklist.length;
  const completionPercentage = Math.round(completionRatio * 100);

  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      setActiveDialog("leave");
    }
  }, [blocker.state]);

  useBeforeUnload((event) => {
    if (!isDirty) {
      return;
    }

    event.preventDefault();
    event.returnValue = "";
  });

  const markTouched = (field: AdminProjectFieldKey) => {
    setTouchedFields((current) => ({
      ...current,
      [field]: true,
    }));
  };

  const getVisibleError = (field: AdminProjectFieldKey) =>
    touchedFields[field] || hasAttemptedSubmit ? activeFieldErrors[field] : undefined;

  const scrollToFirstError = (errors: FormErrors) => {
    const firstField = Object.keys(errors)[0] as AdminProjectFieldKey | undefined;
    if (!firstField) {
      return;
    }

    const target = document.getElementById(`field-${firstField}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
        target.focus();
      }
    }
  };

  const setField = <K extends keyof AdminProject>(key: K, value: AdminProject[K]) => {
    setProject((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const setTrackedField = <K extends keyof AdminProject>(
    key: K,
    fieldKey: AdminProjectFieldKey | null,
    value: AdminProject[K],
  ) => {
    if (fieldKey) {
      markTouched(fieldKey);
    }

    setField(key, value);
  };

  const syncGallery = (gallery: ProjectGalleryItem[]) => {
    setProject((current) => ({
      ...current,
      gallery,
      galleryItems: gallery.map((item, position) => ({
        ...item,
        position,
      })),
    }));
  };

  const announceUpload = (message: string) => {
    setNotice({ tone: "info", message });
    setHasUnsavedUploads(true);
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
      announceUpload(`${field === "thumbnailUrl" ? "Thumbnail" : "Background"} uploaded. Save changes to keep it attached to this project.`);
      if (field === "thumbnailUrl") {
        markTouched("thumbnailUrl");
      }
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
      markTouched("galleryItems");
      announceUpload(`${uploads.length} gallery image${uploads.length === 1 ? "" : "s"} uploaded. Save changes to attach them to the project.`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Gallery upload failed.");
    } finally {
      setUploadingField(null);
    }
  };

  const reorderGallery = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= galleryItems.length || toIndex >= galleryItems.length) {
      return;
    }

    const items = [...galleryItems];
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);
    syncGallery(items);
    markTouched("galleryItems");
  };

  const removeGalleryItem = (index: number) => {
    const items = [...galleryItems];
    items.splice(index, 1);
    syncGallery(items);
    markTouched("galleryItems");
    setNotice({
      tone: "info",
      message: "Gallery item removed. Save changes to make the new order live.",
    });
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
    markTouched("galleryItems");
  };

  const persistProject = async (intent: SubmitIntent) => {
    const nextStatus =
      intent === "draft"
        ? "draft"
        : intent === "publish"
          ? "published"
          : intent === "archive"
            ? "archived"
            : project.status;

    const payload = {
      ...toProjectInput(project),
      status: nextStatus,
    };

    setIsSaving(true);
    setError(null);

    try {
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
      const nextSnapshot = toPersistedSnapshot(nextProject);
      setProject(nextProject);
      setSavedSnapshot(nextSnapshot);
      setTouchedFields({});
      setHasAttemptedSubmit(false);
      setHasUnsavedUploads(false);
      setNotice({
        tone: "success",
        message:
          intent === "publish"
            ? "Project published. The public site can now serve the latest version."
            : intent === "archive"
              ? "Project archived. It will stay out of the public experience until restored."
              : intent === "draft"
                ? "Project saved as draft."
                : "Changes saved.",
      });

      if (isNew && nextProject.id) {
        navigate(`/admin/projects/${nextProject.id}`, { replace: true });
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to save project.");
    } finally {
      setIsSaving(false);
    }
  };

  const validateForIntent = (intent: SubmitIntent) => {
    const nextMode = intent === "publish" ? "publish" : "save";
    const errors = nextMode === "publish" ? publishFieldErrors : saveFieldErrors;

    setValidationMode(nextMode);
    setHasAttemptedSubmit(true);

    if (Object.keys(errors).length > 0) {
      const nextTouched: Partial<Record<AdminProjectFieldKey, boolean>> = {};
      Object.keys(errors).forEach((field) => {
        nextTouched[field as AdminProjectFieldKey] = true;
      });
      setTouchedFields((current) => ({
        ...current,
        ...nextTouched,
      }));
      scrollToFirstError(errors);
      setNotice({
        tone: "warning",
        message:
          nextMode === "publish"
            ? "Fix the highlighted fields before publishing."
            : "Fix the highlighted fields before saving.",
      });
      return false;
    }

    return true;
  };

  const handleAction = (intent: SubmitIntent) => {
    if (!validateForIntent(intent)) {
      return;
    }

    if (intent === "publish") {
      setActiveDialog("publish");
      return;
    }

    if (intent === "archive") {
      setActiveDialog("archive");
      return;
    }

    void persistProject(intent);
  };

  const handleDelete = async () => {
    if (!project.id) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await apiJson<{ deleted: boolean }>(`/api/admin/project?id=${project.id}`, {
        method: "DELETE",
        body: JSON.stringify({}),
      });
      navigate("/admin/projects", { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to delete project.");
    } finally {
      setIsDeleting(false);
      setActiveDialog(null);
    }
  };

  if (isLoading) {
    return (
      <AdminShell
        title="Project editor"
        subtitle="Loading project details from runtime storage."
        breadcrumbs={[{ label: "Projects", to: "/admin/projects" }, { label: "Project editor" }]}
      >
        <div className="rounded-[1.75rem] border border-border/50 bg-card/80 p-8 font-body text-sm text-muted-foreground shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
          Loading project...
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={isNew ? "New project" : project.titleEs || "Project editor"}
      subtitle="Structure the entry, connect media, and use explicit status actions so drafts, published content, and archived work stay distinct."
      breadcrumbs={[
        { label: "Projects", to: "/admin/projects" },
        { label: isNew ? "New project" : project.titleEs || "Project editor" },
      ]}
      headerActions={
        <>
          <Link
            to="/admin/projects"
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-border/60 px-4 py-3 font-body text-sm font-medium text-foreground transition-colors hover:border-primary"
          >
            Back to library
          </Link>
          {previewHref ? (
            <Link
              to={previewHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-border/60 px-4 py-3 font-body text-sm font-medium text-foreground transition-colors hover:border-primary"
            >
              <ExternalLink size={16} />
              <span>Preview live page</span>
            </Link>
          ) : null}
        </>
      }
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleAction("save");
        }}
        className="space-y-6 pb-28 lg:pb-8"
      >
        <nav className="overflow-x-auto rounded-[1.5rem] border border-border/50 bg-card/70 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
          <div className="flex min-w-max gap-2">
            {sectionLinks.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="inline-flex min-h-11 items-center rounded-2xl border border-border/60 px-4 py-3 font-body text-sm font-medium text-foreground transition-colors hover:border-primary"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        {notice ? (
          <div
            className={`rounded-[1.5rem] border px-4 py-3 font-body text-sm ${
              notice.tone === "success"
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                : notice.tone === "warning"
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border/60 bg-card/80 text-foreground"
            }`}
          >
            {notice.message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[1.5rem] border border-destructive/40 bg-destructive/10 px-4 py-3 font-body text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section
              id="basics"
              className="scroll-mt-24 rounded-[1.75rem] border border-border/50 bg-card/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:p-6"
            >
              <div className="flex flex-col gap-2">
                <p className="font-body text-lg font-semibold text-foreground">Basics</p>
                <p className="font-body text-sm leading-6 text-muted-foreground">
                  Start with the information that anchors the project in the library and on the public site.
                </p>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="font-body text-sm font-medium text-foreground">Category</span>
                  <select
                    id="field-category"
                    value={project.category}
                    onChange={(event) => setField("category", event.target.value as AdminProject["category"])}
                    className={`${fieldBaseClass} border-border/60 bg-secondary/20 focus:border-primary mt-2`}
                  >
                    <option value="publicidad">Advertising</option>
                    <option value="documental">Documentary</option>
                  </select>
                  <FieldMessage helper="This controls where the project appears in the public experience." />
                </label>

                <div className="rounded-2xl border border-border/50 bg-secondary/20 px-4 py-3">
                  <p className="font-body text-sm font-medium text-foreground">Current status</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 font-body text-xs font-medium ${statusBadgeClassNames[project.status]}`}
                    >
                      {statusLabels[project.status]}
                    </span>
                    <span className="font-body text-sm text-muted-foreground">
                      Use the action buttons to move between draft, published, and archived states.
                    </span>
                  </div>
                </div>

                <label className="block">
                  <span className="font-body text-sm font-medium text-foreground">Title (Spanish)</span>
                  <input
                    id="field-titleEs"
                    value={project.titleEs}
                    onBlur={() => markTouched("titleEs")}
                    onChange={(event) => setTrackedField("titleEs", "titleEs", event.target.value)}
                    className={`mt-2 ${getFieldClassName(getVisibleError("titleEs"))}`}
                    aria-invalid={Boolean(getVisibleError("titleEs"))}
                  />
                  <FieldMessage
                    error={getVisibleError("titleEs")}
                    helper="Required. This is the primary name used in the admin and on the public site."
                  />
                </label>

                <label className="block">
                  <span className="font-body text-sm font-medium text-foreground">Title (English)</span>
                  <input
                    id="field-titleEn"
                    value={project.titleEn || ""}
                    onChange={(event) => setField("titleEn", event.target.value)}
                    className={`mt-2 ${getFieldClassName()}`}
                  />
                  <FieldMessage helper="Optional. Add this when the English route needs its own localized title." />
                </label>

                <label className="block">
                  <span className="font-body text-sm font-medium text-foreground">Slug (Spanish)</span>
                  <input
                    id="field-slugEs"
                    value={project.slugEs}
                    onBlur={() => markTouched("slugEs")}
                    onChange={(event) => setTrackedField("slugEs", "slugEs", event.target.value.toLowerCase())}
                    className={`mt-2 ${getFieldClassName(getVisibleError("slugEs"))}`}
                    aria-invalid={Boolean(getVisibleError("slugEs"))}
                  />
                  <FieldMessage
                    error={getVisibleError("slugEs")}
                    helper="Required. Use lowercase letters, numbers, and hyphens only."
                  />
                </label>

                <label className="block">
                  <span className="font-body text-sm font-medium text-foreground">Slug (English)</span>
                  <input
                    id="field-slugEn"
                    value={project.slugEn || ""}
                    onBlur={() => markTouched("slugEn")}
                    onChange={(event) => setTrackedField("slugEn", "slugEn", event.target.value.toLowerCase())}
                    className={`mt-2 ${getFieldClassName(getVisibleError("slugEn"))}`}
                    aria-invalid={Boolean(getVisibleError("slugEn"))}
                  />
                  <FieldMessage
                    error={getVisibleError("slugEn")}
                    helper="Optional. Use lowercase letters, numbers, and hyphens only."
                  />
                </label>
              </div>
            </section>

            <section
              id="media"
              className="scroll-mt-24 rounded-[1.75rem] border border-border/50 bg-card/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:p-6"
            >
              <div className="flex flex-col gap-2">
                <p className="font-body text-lg font-semibold text-foreground">Media and credits</p>
                <p className="font-body text-sm leading-6 text-muted-foreground">
                  Connect the playable asset, set who is credited, and keep the structured fields clean for future filtering.
                </p>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {[
                  ["client", "Client", "Brand or commissioning client"],
                  ["productora", "Producer", "Production house or partner"],
                  ["director", "Director", "Director credit"],
                  ["dop", "DOP", "Director of photography"],
                ].map(([key, label, helper]) => (
                  <label key={key} className="block">
                    <span className="font-body text-sm font-medium text-foreground">{label}</span>
                    <input
                      value={String(project[key as keyof AdminProject] || "")}
                      onChange={(event) => setField(key as keyof AdminProject, event.target.value as never)}
                      className={`mt-2 ${getFieldClassName()}`}
                    />
                    <FieldMessage helper={helper} />
                  </label>
                ))}

                <label className="block">
                  <span className="font-body text-sm font-medium text-foreground">Media type</span>
                  <select
                    value={project.mediaType || ""}
                    onChange={(event) => setField("mediaType", (event.target.value || undefined) as never)}
                    className={`${fieldBaseClass} border-border/60 bg-secondary/20 focus:border-primary mt-2`}
                  >
                    <option value="">No primary media</option>
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                  </select>
                  <FieldMessage helper="Set this to video when the public page should embed a playable video." />
                </label>

                <label className="block">
                  <span className="font-body text-sm font-medium text-foreground">Media provider</span>
                  <input
                    value={project.mediaProvider || ""}
                    onChange={(event) => setField("mediaProvider", event.target.value)}
                    className={`mt-2 ${getFieldClassName()}`}
                    placeholder="vimeo, youtube, image"
                  />
                  <FieldMessage helper="Optional. Useful for editorial clarity and future filtering." />
                </label>

                <label className="block md:col-span-2">
                  <span className="font-body text-sm font-medium text-foreground">Video URL</span>
                  <input
                    id="field-videoUrl"
                    value={project.videoUrl || ""}
                    onBlur={() => markTouched("videoUrl")}
                    onChange={(event) => setTrackedField("videoUrl", "videoUrl", event.target.value)}
                    className={`mt-2 ${getFieldClassName(getVisibleError("videoUrl"))}`}
                    aria-invalid={Boolean(getVisibleError("videoUrl"))}
                    placeholder="https://player.vimeo.com/video/..."
                  />
                  <FieldMessage
                    error={getVisibleError("videoUrl")}
                    helper="Required for video projects when publishing. Paste a direct playable URL."
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="font-body text-sm font-medium text-foreground">Credits text</span>
                  <textarea
                    value={project.creditsText || ""}
                    onChange={(event) => setField("creditsText", event.target.value)}
                    className={`mt-2 ${getTextAreaClassName()}`}
                    placeholder="Optional long-form credit block"
                  />
                  <FieldMessage helper="Use this when the structured fields are not enough for the final credit format." />
                </label>
              </div>
            </section>

            <section
              id="assets"
              className="scroll-mt-24 rounded-[1.75rem] border border-border/50 bg-card/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:p-6"
            >
              <div className="flex flex-col gap-2">
                <p className="font-body text-lg font-semibold text-foreground">Assets</p>
                <p className="font-body text-sm leading-6 text-muted-foreground">
                  Upload imagery directly or paste URLs. Uploaded assets are immediate, but they do not become part of the project until you save.
                </p>
              </div>

              <div className="mt-6 space-y-5">
                {[
                  {
                    key: "thumbnailUrl" as const,
                    label: "Thumbnail",
                    inputRef: thumbnailUploadRef,
                    helper: "Required before publishing. Recommended when the project appears in lists or cards.",
                  },
                  {
                    key: "backgroundUrl" as const,
                    label: "Background",
                    inputRef: backgroundUploadRef,
                    helper: "Optional supporting image for the detail page.",
                  },
                ].map((asset) => (
                  <div key={asset.key} className="rounded-[1.5rem] border border-border/50 bg-secondary/20 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-body text-base font-semibold text-foreground">{asset.label}</p>
                        <p className="mt-1 font-body text-sm leading-6 text-muted-foreground">{asset.helper}</p>
                      </div>
                      <div className="flex gap-2">
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
                          className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-border/60 px-4 py-3 font-body text-sm font-medium text-foreground transition-colors hover:border-primary"
                        >
                          <UploadCloud size={16} />
                          <span>{uploadingField === asset.key ? "Uploading..." : "Upload image"}</span>
                        </button>
                      </div>
                    </div>

                    <div
                      className="mt-4 rounded-[1.25rem] border border-dashed border-border/60 bg-background/30 p-4"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const file = event.dataTransfer.files?.[0];
                        if (file) {
                          void handleImageUpload(file, asset.key);
                        }
                      }}
                    >
                      <p className="font-body text-sm text-muted-foreground">
                        Drag and drop an image here, or use the upload button.
                      </p>
                    </div>

                    <label className="mt-4 block">
                      <span className="font-body text-sm font-medium text-foreground">Asset URL</span>
                      <input
                        id={asset.key === "thumbnailUrl" ? "field-thumbnailUrl" : undefined}
                        value={String(project[asset.key] || "")}
                        onBlur={() => {
                          if (asset.key === "thumbnailUrl") {
                            markTouched("thumbnailUrl");
                          }
                        }}
                        onChange={(event) =>
                          setTrackedField(
                            asset.key,
                            asset.key === "thumbnailUrl" ? "thumbnailUrl" : null,
                            event.target.value as never,
                          )
                        }
                        className={`mt-2 ${getFieldClassName(asset.key === "thumbnailUrl" ? getVisibleError("thumbnailUrl") : undefined)}`}
                      />
                      <FieldMessage
                        error={asset.key === "thumbnailUrl" ? getVisibleError("thumbnailUrl") : undefined}
                        helper="You can keep a pasted URL or replace it with a direct upload."
                      />
                    </label>

                    {project[asset.key] ? (
                      <img
                        src={String(project[asset.key])}
                        alt={asset.label}
                        className="mt-4 aspect-[16/10] w-full rounded-[1.25rem] border border-border/40 object-cover"
                      />
                    ) : null}
                  </div>
                ))}

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="font-body text-sm font-medium text-foreground">Thumbnail alt text (Spanish)</span>
                    <input
                      id="field-thumbnailAltEs"
                      value={project.thumbnailAltEs || ""}
                      onBlur={() => markTouched("thumbnailAltEs")}
                      onChange={(event) => setTrackedField("thumbnailAltEs", "thumbnailAltEs", event.target.value)}
                      className={`mt-2 ${getFieldClassName(getVisibleError("thumbnailAltEs"))}`}
                    />
                    <FieldMessage
                      error={getVisibleError("thumbnailAltEs")}
                      helper="Recommended for accessibility and editorial completeness."
                    />
                  </label>

                  <label className="block">
                    <span className="font-body text-sm font-medium text-foreground">Thumbnail alt text (English)</span>
                    <input
                      value={project.thumbnailAltEn || ""}
                      onChange={(event) => setField("thumbnailAltEn", event.target.value)}
                      className={`mt-2 ${getFieldClassName()}`}
                    />
                    <FieldMessage helper="Optional English version for localized routes." />
                  </label>

                  <label className="block">
                    <span className="font-body text-sm font-medium text-foreground">Thumbnail aspect ratio</span>
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
                      className={`mt-2 ${getFieldClassName()}`}
                    />
                    <FieldMessage helper="Optional. Useful when you want deterministic card rendering." />
                  </label>

                  <label className="block">
                    <span className="font-body text-sm font-medium text-foreground">Gallery aspect ratio</span>
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
                      className={`mt-2 ${getFieldClassName()}`}
                    />
                    <FieldMessage helper="Optional shared aspect ratio when the gallery should render consistently." />
                  </label>
                </div>
              </div>
            </section>

            <section
              id="gallery"
              className="scroll-mt-24 rounded-[1.75rem] border border-border/50 bg-card/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-body text-lg font-semibold text-foreground">Gallery</p>
                  <p className="mt-2 font-body text-sm leading-6 text-muted-foreground">
                    Drag in new stills, reorder them directly, and add alt text so the gallery is publish-ready.
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
                    className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-border/60 px-4 py-3 font-body text-sm font-medium text-foreground transition-colors hover:border-primary"
                  >
                    <ImagePlus size={16} />
                    <span>{uploadingField === "gallery" ? "Uploading..." : "Upload gallery images"}</span>
                  </button>
                </div>
              </div>

              <div
                className="mt-5 rounded-[1.5rem] border border-dashed border-border/60 bg-secondary/20 p-5"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  void handleGalleryUpload(event.dataTransfer.files);
                }}
              >
                <p className="font-body text-sm text-muted-foreground">
                  Drop multiple images here to upload them in one pass. Reorder existing items by dragging their cards.
                </p>
                {getVisibleError("galleryItems") ? (
                  <p className="mt-2 font-body text-sm text-destructive">{getVisibleError("galleryItems")}</p>
                ) : null}
              </div>

              <div className="mt-6 space-y-4">
                {galleryItems.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-border/60 px-4 py-8 text-center font-body text-sm text-muted-foreground">
                    No gallery items yet. Upload stills if the project needs a richer detail page.
                  </div>
                ) : (
                  galleryItems.map((item, index) => {
                    const altMissing = !item.altEs;

                    return (
                      <div
                        key={item.id || `${item.imageUrl}-${index}`}
                        draggable
                        onDragStart={() => setDraggingGalleryIndex(index)}
                        onDragEnd={() => setDraggingGalleryIndex(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                          if (draggingGalleryIndex === null) {
                            return;
                          }
                          reorderGallery(draggingGalleryIndex, index);
                          setDraggingGalleryIndex(null);
                        }}
                        className={`grid gap-4 rounded-[1.5rem] border p-4 transition-colors lg:grid-cols-[210px_minmax(0,1fr)_auto] ${
                          draggingGalleryIndex === index
                            ? "border-primary/50 bg-primary/10"
                            : "border-border/50 bg-secondary/20"
                        }`}
                      >
                        <div className="overflow-hidden rounded-[1.25rem] border border-border/40 bg-background/30">
                          <img
                            src={item.imageUrl}
                            alt={item.altEs || `Gallery ${index + 1}`}
                            className="aspect-[16/10] w-full object-cover"
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="md:col-span-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 font-body text-xs font-medium text-muted-foreground">
                              <GripVertical size={14} />
                              Drag to reorder
                            </span>
                            {altMissing ? (
                              <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-body text-xs font-medium text-primary">
                                Alt text missing
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 font-body text-xs font-medium text-emerald-200">
                                Alt text added
                              </span>
                            )}
                          </div>

                          <label className="block">
                            <span className="font-body text-sm font-medium text-foreground">Alt text (Spanish)</span>
                            <input
                              value={item.altEs || ""}
                              onChange={(event) => updateGalleryItem(index, "altEs", event.target.value)}
                              className={`mt-2 ${getFieldClassName()}`}
                            />
                            <FieldMessage helper="Recommended for accessibility and editorial QA." />
                          </label>

                          <label className="block">
                            <span className="font-body text-sm font-medium text-foreground">Alt text (English)</span>
                            <input
                              value={item.altEn || ""}
                              onChange={(event) => updateGalleryItem(index, "altEn", event.target.value)}
                              className={`mt-2 ${getFieldClassName()}`}
                            />
                            <FieldMessage helper="Optional English localization." />
                          </label>

                          <label className="block md:col-span-2">
                            <span className="font-body text-sm font-medium text-foreground">Image URL</span>
                            <input
                              value={item.imageUrl}
                              onChange={(event) => updateGalleryItem(index, "imageUrl", event.target.value)}
                              className={`mt-2 ${getFieldClassName()}`}
                            />
                            <FieldMessage helper="Useful if you need to replace or fix a URL manually." />
                          </label>
                        </div>

                        <div className="flex flex-row gap-2 lg:flex-col">
                          <button
                            type="button"
                            onClick={() => removeGalleryItem(index)}
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-destructive/40 text-destructive transition-colors hover:bg-destructive/10"
                            aria-label={`Remove gallery image ${index + 1}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section
              id="publishing"
              className="scroll-mt-24 rounded-[1.75rem] border border-border/50 bg-card/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:p-6"
            >
              <div className="flex flex-col gap-2">
                <p className="font-body text-lg font-semibold text-foreground">Publishing and metadata</p>
                <p className="font-body text-sm leading-6 text-muted-foreground">
                  Control editorial prominence, URL metadata, and ordering without mixing that up with the actual status transitions.
                </p>
              </div>

              <div className="mt-6 grid gap-5">
                <label className="flex items-center gap-3 rounded-[1.25rem] border border-border/60 bg-secondary/20 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={project.featured}
                    onChange={(event) => setField("featured", event.target.checked)}
                  />
                  <span className="font-body text-sm text-foreground">
                    Feature this project in the editorially promoted set
                  </span>
                </label>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="font-body text-sm font-medium text-foreground">Sort order</span>
                    <input
                      type="number"
                      value={project.sortOrder}
                      onChange={(event) => setField("sortOrder", Number(event.target.value))}
                      className={`mt-2 ${getFieldClassName()}`}
                    />
                    <FieldMessage helper="Lower numbers appear first in manual ordering views." />
                  </label>

                  <div className="rounded-[1.25rem] border border-border/50 bg-secondary/20 px-4 py-4">
                    <p className="font-body text-sm font-medium text-foreground">Editorial health</p>
                    <p className="mt-2 font-body text-sm text-muted-foreground">
                      {projectIsReadyToPublish(project)
                        ? "This draft is ready to publish."
                        : `${publishIssues.length} publishing blocker${publishIssues.length === 1 ? "" : "s"} remaining.`}
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="font-body text-sm font-medium text-foreground">Canonical URL</span>
                    <input
                      id="field-canonicalUrl"
                      value={project.canonicalUrl || ""}
                      onBlur={() => markTouched("canonicalUrl")}
                      onChange={(event) => setTrackedField("canonicalUrl", "canonicalUrl", event.target.value)}
                      className={`mt-2 ${getFieldClassName(getVisibleError("canonicalUrl"))}`}
                    />
                    <FieldMessage
                      error={getVisibleError("canonicalUrl")}
                      helper="Optional. Use only full http or https URLs."
                    />
                  </label>

                  <label className="block">
                    <span className="font-body text-sm font-medium text-foreground">Source URL</span>
                    <input
                      id="field-sourceUrl"
                      value={project.sourceUrl || ""}
                      onBlur={() => markTouched("sourceUrl")}
                      onChange={(event) => setTrackedField("sourceUrl", "sourceUrl", event.target.value)}
                      className={`mt-2 ${getFieldClassName(getVisibleError("sourceUrl"))}`}
                    />
                    <FieldMessage
                      error={getVisibleError("sourceUrl")}
                      helper="Optional reference URL for editorial provenance."
                    />
                  </label>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <section className="rounded-[1.75rem] border border-border/50 bg-card/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-body text-lg font-semibold text-foreground">Publishing status</p>
                  <p className="mt-2 font-body text-sm leading-6 text-muted-foreground">
                    {project.status === "published"
                      ? "This version is live. Saving changes keeps it live."
                      : "This project is not live yet. Publish only after the checklist is clean."}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 font-body text-xs font-medium ${statusBadgeClassNames[project.status]}`}
                >
                  {statusLabels[project.status]}
                </span>
              </div>

              <div className="mt-5 rounded-[1.25rem] border border-border/50 bg-secondary/20 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-body text-sm font-medium text-foreground">Readiness</p>
                  <p className="font-body text-sm font-semibold text-foreground">{completionPercentage}%</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/50">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>

                <div className="mt-4 space-y-3">
                  {readinessChecklist.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                          item.complete
                            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                            : "border-border/60 bg-background/40 text-muted-foreground"
                        }`}
                      >
                        {item.complete ? <CheckCircle2 size={16} /> : <CircleAlert size={16} />}
                      </div>
                      <p className="font-body text-sm text-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => handleAction("save")}
                  disabled={isSaving}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 font-body text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  <Save size={16} />
                  <span>
                    {isSaving
                      ? "Saving..."
                      : project.status === "published"
                        ? "Save live changes"
                        : project.status === "draft"
                          ? "Save draft"
                          : "Save changes"}
                  </span>
                </button>

                {project.status !== "published" ? (
                  <button
                    type="button"
                    onClick={() => handleAction("publish")}
                    disabled={isSaving}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-primary/40 px-4 py-3 font-body text-sm font-medium text-primary disabled:opacity-60"
                  >
                    Publish live
                  </button>
                ) : null}

                {project.status !== "draft" ? (
                  <button
                    type="button"
                    onClick={() => handleAction("draft")}
                    disabled={isSaving}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-border/60 px-4 py-3 font-body text-sm font-medium text-foreground disabled:opacity-60"
                  >
                    Move to draft
                  </button>
                ) : null}

                {!isNew && project.status !== "archived" ? (
                  <button
                    type="button"
                    onClick={() => handleAction("archive")}
                    disabled={isSaving}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border/60 px-4 py-3 font-body text-sm font-medium text-foreground disabled:opacity-60"
                  >
                    <Archive size={16} />
                    <span>Archive project</span>
                  </button>
                ) : null}

                {!isNew ? (
                  <button
                    type="button"
                    onClick={() => setActiveDialog("delete")}
                    disabled={isDeleting}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 px-4 py-3 font-body text-sm font-medium text-destructive disabled:opacity-60"
                  >
                    <Trash2 size={16} />
                    <span>{isDeleting ? "Deleting..." : "Delete project"}</span>
                  </button>
                ) : null}
              </div>

              <div className="mt-5 rounded-[1.25rem] border border-border/50 bg-secondary/20 p-4">
                <p className="font-body text-sm font-medium text-foreground">Save state</p>
                <p className="mt-2 font-body text-sm text-muted-foreground">
                  {isDirty
                    ? hasUnsavedUploads
                      ? "You have unsaved field changes and uploaded assets waiting to be committed."
                      : "You have unsaved changes."
                    : "All changes saved."}
                </p>
                <p className="mt-2 font-body text-sm text-muted-foreground">
                  Last updated {formatRelativeTimestamp(project.updatedAt || project.createdAt)}
                </p>
              </div>

              <div className="mt-5 rounded-[1.25rem] border border-border/50 bg-secondary/20 p-4">
                <p className="font-body text-sm font-medium text-foreground">Preview</p>
                {previewHref ? (
                  <Link
                    to={previewHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border/60 px-4 py-3 font-body text-sm font-medium text-foreground transition-colors hover:border-primary"
                  >
                    <ExternalLink size={16} />
                    <span>Open live page</span>
                  </Link>
                ) : (
                  <p className="mt-2 font-body text-sm leading-6 text-muted-foreground">
                    Preview becomes available once the project is published and has a Spanish slug.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-border/50 bg-card/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              <p className="font-body text-lg font-semibold text-foreground">Issues and notes</p>
              <div className="mt-4 space-y-3">
                {publishIssues.length === 0 && warnings.length === 0 ? (
                  <div className="rounded-[1.25rem] border border-emerald-500/25 bg-emerald-500/10 px-4 py-4 font-body text-sm text-emerald-200">
                    No blockers or editorial warnings right now.
                  </div>
                ) : (
                  <>
                    {publishIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="rounded-[1.25rem] border border-destructive/30 bg-destructive/10 px-4 py-4"
                      >
                        <p className="font-body text-sm font-medium text-destructive">{issue.label}</p>
                        <p className="mt-1 font-body text-sm text-muted-foreground">
                          Publishing will stay blocked until this is resolved.
                        </p>
                      </div>
                    ))}
                    {warnings.map((issue) => (
                      <div
                        key={issue.id}
                        className="rounded-[1.25rem] border border-primary/30 bg-primary/10 px-4 py-4"
                      >
                        <p className="font-body text-sm font-medium text-primary">{issue.label}</p>
                        <p className="mt-1 font-body text-sm text-muted-foreground">
                          This will not block save, but it is worth fixing before editorial handoff.
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-border/50 bg-card/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              <p className="font-body text-lg font-semibold text-foreground">Metadata</p>
              <div className="mt-4 space-y-3">
                {[
                  ["Project ID", project.id || "Generated after first save"],
                  ["Created", formatSyncTimestamp(project.createdAt)],
                  ["Updated", formatSyncTimestamp(project.updatedAt)],
                  ["Published", formatSyncTimestamp(project.publishedAt)],
                  ["Signed in as", session.email || "Admin"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-border/50 bg-secondary/20 px-4 py-3"
                  >
                    <span className="font-body text-sm text-muted-foreground">{label}</span>
                    <span className="font-body text-sm font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-background/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-3xl gap-3">
          <button
            type="button"
            onClick={() => handleAction("save")}
            disabled={isSaving}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl bg-primary px-4 py-3 font-body text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          {project.status !== "published" ? (
            <button
              type="button"
              onClick={() => handleAction("publish")}
              disabled={isSaving}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl border border-primary/40 px-4 py-3 font-body text-sm font-medium text-primary disabled:opacity-60"
            >
              Publish
            </button>
          ) : null}
        </div>
      </div>

      <AdminDialog
        open={activeDialog === "publish"}
        title="Publish this project?"
        description="Publishing makes this entry available to the public site immediately through the runtime APIs."
        confirmLabel="Publish now"
        cancelLabel="Keep editing"
        tone="warning"
        onCancel={() => setActiveDialog(null)}
        onConfirm={() => {
          setActiveDialog(null);
          void persistProject("publish");
        }}
      >
        <p className="font-body text-sm leading-6 text-muted-foreground">
          Double-check the preview path, thumbnail, and accessibility copy. Publishing is safe only when the checklist is clean.
        </p>
      </AdminDialog>

      <AdminDialog
        open={activeDialog === "archive"}
        title="Archive this project?"
        description="Archiving removes it from the published set while preserving the content for later recovery."
        confirmLabel="Archive project"
        cancelLabel="Keep current status"
        tone="warning"
        onCancel={() => setActiveDialog(null)}
        onConfirm={() => {
          setActiveDialog(null);
          void persistProject("archive");
        }}
      >
        <p className="font-body text-sm leading-6 text-muted-foreground">
          Use archive when the content should stay in the CMS but no longer appear as active public work.
        </p>
      </AdminDialog>

      <AdminDialog
        open={activeDialog === "delete"}
        title="Delete this project?"
        description="This action cannot be undone. The project record will be removed from runtime storage."
        confirmLabel="Delete permanently"
        cancelLabel="Cancel"
        tone="destructive"
        onCancel={() => setActiveDialog(null)}
        onConfirm={() => {
          void handleDelete();
        }}
      >
        <p className="font-body text-sm leading-6 text-muted-foreground">
          If you only want it off the site, archiving is usually safer than deletion.
        </p>
      </AdminDialog>

      <AdminDialog
        open={activeDialog === "leave"}
        title="Leave without saving?"
        description="You have unsaved changes in the editor. Leaving now will discard local edits and any uploaded asset assignments that were not saved."
        confirmLabel="Leave without saving"
        cancelLabel="Stay here"
        tone="warning"
        onCancel={() => {
          blocker.reset?.();
          setActiveDialog(null);
        }}
        onConfirm={() => {
          setActiveDialog(null);
          blocker.proceed?.();
        }}
      />
    </AdminShell>
  );
};

export default AdminProjectForm;
