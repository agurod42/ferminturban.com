import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ExternalLink, PlusSquare, Search, SlidersHorizontal } from "lucide-react";
import AdminSelect from "@/components/admin/AdminSelect";
import AdminShell from "@/components/admin/AdminShell";
import { AdminInset, AdminPanel, AdminSectionHeading } from "@/components/admin/AdminSurface";
import { useAdminProjects } from "@/hooks/useAdminProjects";
import { usePublicContent } from "@/hooks/usePublicContent";
import { featuredProjectsEnabled } from "@/lib/admin/features";
import {
  categoryBadgeClassNames,
  categoryLabels,
  formatRelativeTimestamp,
  formatSyncTimestamp,
  getAdminProjectIssues,
  getAdminProjectWarnings,
  getProjectPreviewHref,
  getProjectTimestamp,
  projectIsReadyToPublish,
  projectNeedsAttention,
  statusBadgeClassNames,
  statusLabels,
} from "@/lib/admin/projects";

type LibraryView =
  | "all"
  | "draft"
  | "published"
  | "featured"
  | "attention"
  | "ready"
  | "media"
  | "accessibility";

type LibrarySort = "recent" | "manual" | "title";

const AdminProjects = () => {
  const { projects, isLoading, error, source, syncedAt } = useAdminProjects();
  const { sharedThumbnailAspectRatio } = usePublicContent();
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedView = (searchParams.get("view") as LibraryView | null) || "all";
  const view = !featuredProjectsEnabled && requestedView === "featured" ? "all" : requestedView;
  const category = searchParams.get("category") || "all";
  const sort = (searchParams.get("sort") as LibrarySort | null) || "recent";
  const query = searchParams.get("q") || "";

  const updateFilters = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all") {
        next.delete(key);
        return;
      }

      next.set(key, value);
    });

    setSearchParams(next);
  };

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const nextProjects = projects.filter((project) => {
      if (category !== "all" && project.category !== category) {
        return false;
      }

      switch (view) {
        case "draft":
          if (project.status !== "draft") {
            return false;
          }
          break;
        case "published":
          if (project.status !== "published") {
            return false;
          }
          break;
        case "featured":
          if (!project.featured) {
            return false;
          }
          break;
        case "attention":
          if (!projectNeedsAttention(project)) {
            return false;
          }
          break;
        case "ready":
          if (!projectIsReadyToPublish(project)) {
            return false;
          }
          break;
        case "media":
          if (!getAdminProjectIssues(project).some((issue) => issue.id === "missing-thumbnail" || issue.id === "missing-video-url")) {
            return false;
          }
          break;
        case "accessibility":
          if (!getAdminProjectWarnings(project).some((issue) => issue.field === "thumbnailAltEs" || issue.field === "galleryItems")) {
            return false;
          }
          break;
        default:
          break;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        project.titleEs,
        project.titleEn,
        project.client,
        project.slugEs,
        project.slugEn,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
    });

    if (sort === "title") {
      return [...nextProjects].sort((left, right) =>
        left.titleEs.localeCompare(right.titleEs, undefined, { sensitivity: "base" }),
      );
    }

    if (sort === "manual") {
      return [...nextProjects].sort((left, right) => {
        if (left.sortOrder !== right.sortOrder) {
          return left.sortOrder - right.sortOrder;
        }

        return left.titleEs.localeCompare(right.titleEs, undefined, { sensitivity: "base" });
      });
    }

    return [...nextProjects].sort((left, right) =>
      getProjectTimestamp(right).localeCompare(getProjectTimestamp(left)),
    );
  }, [category, projects, query, sort, view]);

  const savedViews = [
    { key: "all", label: "All", count: projects.length },
    { key: "draft", label: "Drafts", count: projects.filter((project) => project.status === "draft").length },
    { key: "published", label: "Published", count: projects.filter((project) => project.status === "published").length },
    ...(featuredProjectsEnabled
      ? [{ key: "featured", label: "Featured", count: projects.filter((project) => project.featured).length }]
      : []),
    { key: "attention", label: "Needs attention", count: projects.filter(projectNeedsAttention).length },
    { key: "ready", label: "Ready to publish", count: projects.filter(projectIsReadyToPublish).length },
  ] as const;

  return (
    <AdminShell
      title="Projects"
      subtitle="Use the library as the operational hub for finding drafts, reviewing live entries, and fixing problems before publishing."
      breadcrumbs={[{ label: "Projects" }]}
      headerActions={
        <Link
          to="/admin/projects/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 font-body text-sm font-medium text-primary-foreground"
        >
          <PlusSquare size={16} />
          <span>New project</span>
        </Link>
      }
    >
      <AdminPanel className="p-5 sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <AdminSectionHeading
              title="Library overview"
              description={
                isLoading
                  ? "Loading runtime entries..."
                  : `${filteredProjects.length} of ${projects.length} projects shown · source ${(source || "unknown").toUpperCase()} · synced ${formatSyncTimestamp(syncedAt || undefined)}`
              }
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {savedViews.map((item) => {
              const active = view === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => updateFilters({ view: item.key })}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 font-body text-sm font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/60 bg-secondary/20 text-foreground hover:border-primary/40"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs ${active ? "bg-primary-foreground/15 text-primary-foreground" : "bg-background/60 text-muted-foreground"}`}>
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_200px_180px]">
            <label className="relative block">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(event) => updateFilters({ q: event.target.value || null })}
                placeholder="Search by title, client, or slug"
                className="min-h-11 w-full rounded-2xl border border-border/60 bg-secondary/30 pl-11 pr-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
              />
            </label>

            <label className="block">
              <span className="sr-only">Category</span>
              <AdminSelect
                value={category}
                onChange={(event) => updateFilters({ category: event.target.value })}
                className="bg-secondary/30"
              >
                <option value="all">All categories</option>
                <option value="publicidad">Advertising</option>
                <option value="documental">Documentary</option>
              </AdminSelect>
            </label>

            <label className="block">
              <span className="sr-only">Sort</span>
              <AdminSelect
                value={sort}
                onChange={(event) => updateFilters({ sort: event.target.value })}
                className="bg-secondary/30"
                leading={<SlidersHorizontal size={16} />}
              >
                <option value="recent">Recently updated</option>
                <option value="manual">Sort order</option>
                <option value="title">Alphabetical</option>
              </AdminSelect>
            </label>
          </div>
        </div>
      </AdminPanel>

      <section className="mt-6">
        {isLoading ? (
          <AdminPanel className="px-5 py-10 font-body text-sm text-muted-foreground">Loading projects...</AdminPanel>
        ) : error ? (
          <AdminInset className="border-destructive/30 bg-destructive/8 px-5 py-4 text-destructive">
            {error}
          </AdminInset>
        ) : filteredProjects.length === 0 ? (
          <AdminPanel className="border-dashed bg-card/56 px-5 py-10 text-center shadow-none">
            <p className="font-body text-lg font-semibold text-foreground">No projects match this view</p>
            <p className="mt-2 font-body text-sm leading-6 text-muted-foreground">
              Adjust filters or create a new project to start the next editorial cycle.
            </p>
            <Link
              to="/admin/projects/new"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl bg-primary px-4 py-3 font-body text-sm font-medium text-primary-foreground"
            >
              Create project
            </Link>
          </AdminPanel>
        ) : (
          <AdminPanel className="overflow-hidden">
            {filteredProjects.map((project, index) => {
              const previewHref = project.status === "published" ? getProjectPreviewHref(project) : null;
              const issues = getAdminProjectIssues(project);
              const thumbnail = project.thumbnailUrl || project.backgroundUrl || project.galleryItems?.[0]?.imageUrl;

              return (
                <article
                  key={project.id}
                  className={`${index > 0 ? "border-t border-border/35" : ""}`}
                >
                  <div className="grid gap-0 xl:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="border-b border-border/30 bg-black xl:border-b-0 xl:border-r xl:border-border/30">
                      {thumbnail ? (
                        <>
                          <div
                            className="flex items-center justify-center bg-black xl:hidden"
                            style={{
                              aspectRatio: sharedThumbnailAspectRatio,
                            }}
                          >
                            <img
                              src={thumbnail}
                              alt={project.thumbnailAltEs || project.titleEs || "Project thumbnail"}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div className="hidden h-full min-h-[160px] items-center justify-center bg-black xl:flex">
                            <img
                              src={thumbnail}
                              alt={project.thumbnailAltEs || project.titleEs || "Project thumbnail"}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className="flex items-center justify-center bg-black px-6 text-center font-body text-sm text-muted-foreground xl:hidden"
                            style={{
                              aspectRatio: sharedThumbnailAspectRatio,
                            }}
                          >
                            Thumbnail missing
                          </div>
                          <div className="hidden h-full min-h-[160px] items-center justify-center bg-black px-6 text-center font-body text-sm text-muted-foreground xl:flex">
                            Thumbnail missing
                          </div>
                        </>
                      )}
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to={`/admin/projects/${project.id}`}
                              className="font-body text-xl font-semibold text-foreground transition-colors hover:text-primary"
                            >
                              {project.titleEs || "Untitled project"}
                            </Link>
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 font-body text-xs font-medium ${categoryBadgeClassNames[project.category]}`}
                            >
                              {categoryLabels[project.category]}
                            </span>
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 font-body text-xs font-medium ${statusBadgeClassNames[project.status]}`}
                            >
                              {statusLabels[project.status]}
                            </span>
                            {featuredProjectsEnabled && project.featured ? (
                              <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-body text-xs font-medium text-primary">
                                Featured
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-2 font-body text-sm text-muted-foreground">{project.client || "No client set"}</p>
                          <p className="mt-1 font-body text-sm text-muted-foreground">
                            /{project.slugEs || "missing-slug"}
                            {project.slugEn ? ` · /${project.slugEn}` : ""}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>Updated {formatRelativeTimestamp(getProjectTimestamp(project))}</span>
                            <span>Order {project.sortOrder}</span>
                            <span>{previewHref ? "Live on site" : "Not live yet"}</span>
                          </div>

                          {issues.length > 0 ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {issues.slice(0, 3).map((issue) => (
                                <span
                                  key={issue.id}
                                  className={`inline-flex rounded-full border px-2.5 py-1 font-body text-xs font-medium ${
                                    issue.severity === "critical"
                                      ? "border-destructive/30 bg-destructive/10 text-destructive"
                                      : "border-primary/30 bg-primary/10 text-primary"
                                  }`}
                                >
                                  {issue.label}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-4 inline-flex rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 font-body text-xs font-medium text-emerald-700 dark:text-emerald-200">
                              Ready for editorial review
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          <Link
                            to={`/admin/projects/${project.id}`}
                            className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-primary px-4 py-3 font-body text-sm font-medium text-primary-foreground"
                          >
                            Edit project
                          </Link>
                          {previewHref ? (
                            <Link
                              to={previewHref}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-border/60 px-4 py-3 font-body text-sm font-medium text-foreground transition-colors hover:border-primary"
                            >
                              <ExternalLink size={15} />
                              <span>Preview live page</span>
                            </Link>
                          ) : (
                            <span className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-border/50 px-4 py-3 font-body text-sm text-muted-foreground">
                              Publish to preview
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </AdminPanel>
        )}
      </section>
    </AdminShell>
  );
};

export default AdminProjects;
