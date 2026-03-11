import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CircleCheckBig,
  Clock3,
  FileWarning,
  ImageOff,
  PlusSquare,
  Sparkles,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminInset, AdminPanel, AdminSectionHeading } from "@/components/admin/AdminSurface";
import { useAdminProjects } from "@/hooks/useAdminProjects";
import {
  categoryLabels,
  formatRelativeTimestamp,
  formatSyncTimestamp,
  getAdminProjectIssues,
  getAdminProjectWarnings,
  getProjectPreviewHref,
  getProjectTimestamp,
  projectIsReadyToPublish,
  projectNeedsAttention,
  sortProjectsForAdmin,
  statusBadgeClassNames,
  statusLabels,
} from "@/lib/admin/projects";

const AdminDashboard = () => {
  const { projects, isLoading, error, source, syncedAt } = useAdminProjects();
  const orderedProjects = sortProjectsForAdmin(projects);
  const recentProjects = [...orderedProjects]
    .sort((left, right) => getProjectTimestamp(right).localeCompare(getProjectTimestamp(left)))
    .slice(0, 6);

  const attentionProjects = projects.filter(projectNeedsAttention);
  const readyToPublish = projects.filter(projectIsReadyToPublish);
  const missingMedia = projects.filter((project) =>
    getAdminProjectIssues(project).some((issue) => issue.id === "missing-thumbnail" || issue.id === "missing-video-url"),
  );
  const accessibilityWarnings = projects.filter((project) =>
    getAdminProjectWarnings(project).some((issue) => issue.field === "thumbnailAltEs" || issue.field === "galleryItems"),
  );

  const workQueues = [
    {
      label: "Needs attention",
      value: attentionProjects.length,
      description: "Projects blocked by missing essentials, invalid links, or publishing warnings.",
      to: "/admin/projects?view=attention",
      icon: FileWarning,
      tone: "warning",
    },
    {
      label: "Ready to publish",
      value: readyToPublish.length,
      description: "Drafts that already have the content needed to go live cleanly.",
      to: "/admin/projects?view=ready",
      icon: CircleCheckBig,
      tone: "success",
    },
    {
      label: "Missing media",
      value: missingMedia.length,
      description: "Entries missing a thumbnail or required playable media.",
      to: "/admin/projects?view=media",
      icon: ImageOff,
      tone: "warning",
    },
    {
      label: "Accessibility follow-up",
      value: accessibilityWarnings.length,
      description: "Projects that still need alt text coverage before they are editorially complete.",
      to: "/admin/projects?view=accessibility",
      icon: Sparkles,
      tone: "neutral",
    },
  ] as const;

  return (
    <AdminShell
      title="Dashboard"
      subtitle="Treat the admin as a working content desk. Start with the queues that need action, then move into the project library for detailed edits."
      breadcrumbs={[{ label: "Dashboard" }]}
      headerActions={
        <>
          <Link
            to="/admin/projects"
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-border/60 px-4 py-3 font-body text-sm font-medium text-foreground transition-colors hover:border-primary"
          >
            Open project library
          </Link>
          <Link
            to="/admin/projects/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 font-body text-sm font-medium text-primary-foreground"
          >
            <PlusSquare size={16} />
            <span>New project</span>
          </Link>
        </>
      }
    >
      <AdminPanel className="overflow-hidden p-1">
        <div className="grid gap-px overflow-hidden rounded-[1.2rem] bg-border/30 lg:grid-cols-2 xl:grid-cols-4">
          {workQueues.map((item) => {
            const Icon = item.icon;
            const iconToneClassName =
              item.tone === "success"
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                : item.tone === "warning"
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border/60 bg-secondary/40 text-foreground";

            return (
              <Link
                key={item.label}
                to={item.to}
                className="group bg-card/28 px-5 py-5 transition-colors hover:bg-primary/6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-body text-sm font-medium text-muted-foreground">{item.label}</p>
                    <p className="mt-3 font-body text-4xl font-semibold tracking-tight text-foreground">
                      {isLoading ? "..." : item.value}
                    </p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full border ${iconToneClassName}`}>
                    <Icon size={18} />
                  </div>
                </div>
                <p className="mt-4 font-body text-sm leading-6 text-muted-foreground">{item.description}</p>
                <div className="mt-5 inline-flex items-center gap-2 font-body text-sm font-medium text-primary">
                  <span>Review queue</span>
                  <ArrowRight size={15} />
                </div>
              </Link>
            );
          })}
        </div>
      </AdminPanel>

      {error ? (
        <AdminInset className="mt-4 border-destructive/30 bg-destructive/8 px-4 py-3 text-destructive">
          {error}
        </AdminInset>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <AdminPanel className="p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <AdminSectionHeading
              title="Recent changes"
              description="Pick up where you left off, check what is live, and jump back into the entries that changed most recently."
            />
            <Link
              to="/admin/projects?sort=recent"
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-border/60 px-4 py-3 font-body text-sm font-medium text-foreground transition-colors hover:border-primary"
            >
              <Clock3 size={16} />
              <span>View all recent</span>
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {isLoading ? (
              <AdminInset className="border-dashed px-4 py-8 font-body text-sm text-muted-foreground">
                Loading recent project activity...
              </AdminInset>
            ) : recentProjects.length === 0 ? (
              <AdminInset className="border-dashed px-4 py-8 font-body text-sm text-muted-foreground">
                No runtime projects are available yet.
              </AdminInset>
            ) : (
              recentProjects.map((project, index) => {
                const previewHref = project.status === "published" ? getProjectPreviewHref(project) : null;
                const projectIssues = getAdminProjectIssues(project);

                return (
                  <div
                    key={project.id}
                    className={`${index > 0 ? "border-t border-border/35 pt-5" : "pt-0"} pb-1`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/admin/projects/${project.id}`}
                            className="font-body text-lg font-semibold text-foreground transition-colors hover:text-primary"
                          >
                            {project.titleEs || "Untitled project"}
                          </Link>
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 font-body text-xs font-medium ${statusBadgeClassNames[project.status]}`}
                          >
                            {statusLabels[project.status]}
                          </span>
                        </div>
                        <p className="mt-2 font-body text-sm text-muted-foreground">
                          {categoryLabels[project.category]} · {project.client || project.slugEs || "No client yet"}
                        </p>
                        <p className="mt-1 font-body text-sm text-muted-foreground">
                          Updated {formatRelativeTimestamp(getProjectTimestamp(project))}
                        </p>
                        {projectIssues.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {projectIssues.slice(0, 2).map((issue) => (
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
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/admin/projects/${project.id}`}
                          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-primary px-4 py-3 font-body text-sm font-medium text-primary-foreground"
                        >
                          Edit
                        </Link>
                        {previewHref ? (
                          <Link
                            to={previewHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-border/60 px-4 py-3 font-body text-sm font-medium text-foreground"
                          >
                            Preview live page
                          </Link>
                        ) : (
                          <span className="inline-flex min-h-11 items-center rounded-2xl border border-border/50 px-4 py-3 font-body text-sm text-muted-foreground">
                            Not live yet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </AdminPanel>

        <AdminPanel className="p-5 sm:p-6">
          <AdminSectionHeading
            title="Operations"
            description="Keep the side rail for follow-up queues and runtime health, not for more primary cards."
          />
          <div className="mt-5 space-y-4">
            <AdminInset className="p-4">
              <p className="font-body text-sm font-semibold text-foreground">Editorial focus</p>
              <div className="mt-4 space-y-3">
                {[
                  {
                    label: "Drafts waiting for publication",
                    value: readyToPublish.length,
                    to: "/admin/projects?view=ready",
                  },
                  {
                    label: "Projects blocked by missing media",
                    value: missingMedia.length,
                    to: "/admin/projects?view=media",
                  },
                  {
                    label: "Entries with outstanding accessibility notes",
                    value: accessibilityWarnings.length,
                    to: "/admin/projects?view=accessibility",
                  },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="flex items-center justify-between gap-3 rounded-[1rem] border border-border/35 bg-background/35 px-4 py-4 transition-colors hover:border-primary/40"
                  >
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">{item.label}</p>
                      <p className="mt-1 font-body text-sm text-muted-foreground">
                        Open the filtered library view
                      </p>
                    </div>
                    <span className="font-body text-2xl font-semibold text-foreground">{item.value}</span>
                  </Link>
                ))}
              </div>
            </AdminInset>

            <AdminInset className="p-4">
              <p className="font-body text-sm font-semibold text-foreground">System status</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-[1rem] border border-border/35 bg-background/35 px-4 py-4">
                  <p className="font-body text-sm font-medium text-muted-foreground">Runtime source</p>
                  <p className="mt-2 font-body text-xl font-semibold text-foreground">
                    {(source || "unknown").toUpperCase()}
                  </p>
                </div>
                <div className="rounded-[1rem] border border-border/35 bg-background/35 px-4 py-4">
                  <p className="font-body text-sm font-medium text-muted-foreground">Last sync</p>
                  <p className="mt-2 font-body text-sm leading-6 text-foreground">
                    {formatSyncTimestamp(syncedAt || undefined)}
                  </p>
                </div>
                <div className="rounded-[1rem] border border-primary/20 bg-primary/10 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0 text-primary" />
                    <p className="font-body text-sm leading-6 text-foreground">
                      Publishing actions use the same runtime APIs as the public site. Drafts stay safe until you explicitly publish them from the editor.
                    </p>
                  </div>
                </div>
              </div>
            </AdminInset>
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
};

export default AdminDashboard;
