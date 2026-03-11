import { Link } from "react-router-dom";
import { ArrowRight, FolderKanban, ImagePlus, Sparkles, Star } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminProjects } from "@/hooks/useAdminProjects";
import {
  categoryLabels,
  formatSyncTimestamp,
  getProjectPreviewHref,
  getProjectTimestamp,
  sortProjectsForAdmin,
  statusBadgeClassNames,
  statusLabels,
} from "@/lib/admin/projects";

const AdminDashboard = () => {
  const { projects, isLoading, error, source, syncedAt } = useAdminProjects();
  const orderedProjects = sortProjectsForAdmin(projects);
  const published = projects.filter((project) => project.status === "published").length;
  const drafts = projects.filter((project) => project.status === "draft").length;
  const featured = projects.filter((project) => project.featured).length;
  const recentProjects = [...orderedProjects]
    .sort((left, right) => getProjectTimestamp(right).localeCompare(getProjectTimestamp(left)))
    .slice(0, 5);

  return (
    <AdminShell
      title="Dashboard"
      subtitle="Manage runtime portfolio content, media and publishing state from the same Vercel deployment."
    >
      <div className="grid gap-5 md:grid-cols-4">
        {[
          { label: "Projects", value: isLoading ? "..." : String(projects.length), icon: FolderKanban },
          { label: "Published", value: isLoading ? "..." : String(published), icon: Sparkles },
          { label: "Drafts", value: isLoading ? "..." : String(drafts), icon: ImagePlus },
          { label: "Featured", value: isLoading ? "..." : String(featured), icon: Star },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-3xl border border-border/50 bg-card/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-4 font-display text-5xl tracking-[0.12em] text-foreground">
                    {item.value}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                  <Icon size={18} className="text-primary" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {error ? (
        <div className="mt-6 rounded-3xl border border-destructive/40 bg-destructive/10 px-5 py-4 font-body text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-border/50 bg-card/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-body text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                Recently Touched
              </p>
              <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-muted-foreground">
                This is the fastest path for continuing edits or checking what is currently live.
              </p>
            </div>
            <Link
              to="/admin/projects"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 font-body text-[10px] uppercase tracking-[0.24em] text-foreground transition-colors hover:border-primary"
            >
              <span>Open Library</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {isLoading ? (
              <div className="rounded-2xl border border-dashed border-border/60 px-4 py-8 font-body text-sm text-muted-foreground">
                Loading project activity...
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 px-4 py-8 font-body text-sm text-muted-foreground">
                No runtime projects are available yet.
              </div>
            ) : (
              recentProjects.map((project) => {
                const previewHref = project.status === "published" ? getProjectPreviewHref(project) : null;

                return (
                  <div
                    key={project.id}
                    className="rounded-2xl border border-border/40 bg-secondary/20 px-4 py-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display text-xl tracking-[0.08em] text-foreground">
                            {project.titleEs.toUpperCase()}
                          </p>
                          <span
                            className={`rounded-full border px-2.5 py-1 font-body text-[10px] uppercase tracking-[0.22em] ${statusBadgeClassNames[project.status]}`}
                          >
                            {statusLabels[project.status]}
                          </span>
                        </div>
                        <p className="mt-2 font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {categoryLabels[project.category]} · {project.client || project.slugEs}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/admin/projects/${project.id}`}
                          className="rounded-full bg-primary px-4 py-2 font-body text-[10px] uppercase tracking-[0.24em] text-primary-foreground"
                        >
                          Edit
                        </Link>
                        {previewHref ? (
                          <Link
                            to={previewHref}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-border/60 px-4 py-2 font-body text-[10px] uppercase tracking-[0.24em] text-foreground"
                          >
                            Preview
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-border/50 bg-card/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
            <p className="font-body text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              Quick Actions
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/admin/projects/new"
                className="rounded-full bg-primary px-5 py-3 font-body text-xs uppercase tracking-[0.24em] text-primary-foreground"
              >
                New Project
              </Link>
              <Link
                to="/admin/projects"
                className="rounded-full border border-border/60 px-5 py-3 font-body text-xs uppercase tracking-[0.24em] text-foreground"
              >
                Review Library
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-border/50 bg-card/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
            <p className="font-body text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              Runtime Storage
            </p>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-border/50 bg-secondary/20 px-4 py-4">
                <p className="font-body text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                  Source
                </p>
                <p className="mt-2 font-display text-2xl tracking-[0.08em] text-foreground">
                  {(source || "unknown").toUpperCase()}
                </p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-secondary/20 px-4 py-4">
                <p className="font-body text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                  Last Sync
                </p>
                <p className="mt-2 font-body text-sm leading-relaxed text-foreground">
                  {formatSyncTimestamp(syncedAt || undefined)}
                </p>
              </div>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">
                Saves go through the admin API and the public site reads the same runtime content
                source once the rollout is fully connected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
};

export default AdminDashboard;
