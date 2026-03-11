import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { ExternalLink, PlusSquare } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminProjects } from "@/hooks/useAdminProjects";
import {
  categoryLabels,
  formatSyncTimestamp,
  getProjectPreviewHref,
  sortProjectsForAdmin,
  statusBadgeClassNames,
  statusLabels,
} from "@/lib/admin/projects";

const AdminProjects = () => {
  const { projects, isLoading, error, source, syncedAt } = useAdminProjects();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published" | "archived">("all");

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sortProjectsForAdmin(projects).filter((project) => {
      if (statusFilter !== "all" && project.status !== statusFilter) {
        return false;
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
  }, [projects, query, statusFilter]);

  return (
    <AdminShell
      title="Projects"
      subtitle="Create, edit, publish and archive runtime portfolio entries. All changes are served through the Vercel API without rebuilding the site."
    >
      <div className="rounded-3xl border border-border/50 bg-card/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Library Status
              </p>
              <p className="mt-3 font-body text-sm text-muted-foreground">
                {isLoading
                  ? "Loading runtime entries..."
                  : `${filteredProjects.length} of ${projects.length} projects shown · source ${(source || "unknown").toUpperCase()} · synced ${formatSyncTimestamp(syncedAt || undefined)}`}
              </p>
            </div>
            <Link
              to="/admin/projects/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-center font-body text-xs uppercase tracking-[0.28em] text-primary-foreground"
            >
              <PlusSquare size={15} />
              <span>New Project</span>
            </Link>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, client or slug"
              className="w-full rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm text-foreground outline-none focus:border-primary"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              className="rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 font-body text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-border/50 bg-card/80 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
        <div className="hidden grid-cols-[1.4fr_0.8fr_0.7fr_0.5fr_0.6fr] gap-4 border-b border-border/40 px-5 py-4 font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground lg:grid">
          <span>Project</span>
          <span>Category</span>
          <span>Status</span>
          <span>Order</span>
          <span>Open</span>
        </div>

        {isLoading ? (
          <div className="px-5 py-10 font-body text-sm text-muted-foreground">Loading projects...</div>
        ) : error ? (
          <div className="px-5 py-10 font-body text-sm text-destructive">{error}</div>
        ) : filteredProjects.length === 0 ? (
          <div className="px-5 py-10 font-body text-sm text-muted-foreground">No projects match the current filter.</div>
        ) : (
          filteredProjects.map((project) => {
            const previewHref = project.status === "published" ? getProjectPreviewHref(project) : null;

            return (
              <div
                key={project.id}
                className="grid grid-cols-1 gap-3 border-b border-border/30 px-5 py-5 last:border-b-0 lg:grid-cols-[1.4fr_0.8fr_0.7fr_0.5fr_0.6fr] lg:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-lg tracking-[0.08em] text-foreground">
                      {project.titleEs.toUpperCase()}
                    </p>
                    {project.featured ? (
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-body text-[10px] uppercase tracking-[0.22em] text-primary">
                        Featured
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {project.client || project.slugEs}
                  </p>
                  <p className="mt-2 font-body text-xs text-muted-foreground">
                    /{project.slugEs}
                    {project.slugEn ? ` · /${project.slugEn}` : ""}
                  </p>
                </div>
                <p className="font-body text-sm text-foreground">{categoryLabels[project.category]}</p>
                <div>
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 font-body text-[10px] uppercase tracking-[0.22em] ${statusBadgeClassNames[project.status]}`}
                  >
                    {statusLabels[project.status]}
                  </span>
                </div>
                <p className="font-body text-sm text-foreground">{project.sortOrder}</p>
                <div className="flex items-center gap-4">
                  <Link
                    to={`/admin/projects/${project.id}`}
                    className="font-body text-xs uppercase tracking-[0.2em] text-primary"
                  >
                    Edit
                  </Link>
                  {previewHref ? (
                    <Link
                      to={previewHref}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      title="Open public page"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </AdminShell>
  );
};

export default AdminProjects;
