import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import staticProjects from "@/data/projects";
import { apiJson } from "@/lib/api";
import type { Lang } from "@/types/language";
import type { Project, ProjectCategory, ProjectsResponse, PublicProjectsContextValue } from "@/types/project";
import {
  computeSharedThumbnailAspectRatio,
  findProjectByLocalizedSlug,
} from "@/lib/project-utils";

const PublicContentContext = createContext<PublicProjectsContextValue | null>(null);

const fallbackProjects = staticProjects.projects;

const sortProjects = (projects: Project[]) =>
  [...projects].sort((left, right) => {
    const leftFeatured = left.featured ? 1 : 0;
    const rightFeatured = right.featured ? 1 : 0;

    if (leftFeatured !== rightFeatured) {
      return rightFeatured - leftFeatured;
    }

    const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.title.localeCompare(right.title, "es", {
      sensitivity: "base",
      numeric: true,
    });
  });

export const PublicContentProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(sortProjects(fallbackProjects));
  const [source, setSource] = useState<ProjectsResponse["source"]>("static");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = await apiJson<ProjectsResponse>("/api/projects?status=published");
      const nextProjects = Array.isArray(payload.projects) && payload.projects.length > 0
        ? sortProjects(payload.projects)
        : sortProjects(fallbackProjects);
      setProjects(nextProjects);
      setSource(
        Array.isArray(payload.projects) && payload.projects.length > 0
          ? payload.source
          : "static",
      );
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Failed to load projects";
      setProjects(sortProjects(fallbackProjects));
      setSource("static");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const value = useMemo<PublicProjectsContextValue>(() => {
    const sortedProjects = sortProjects(projects);
    return {
      projects: sortedProjects,
      source,
      isLoading,
      error,
      sharedThumbnailAspectRatio: computeSharedThumbnailAspectRatio(sortedProjects),
      getProjectsByCategory: (category: ProjectCategory) =>
        sortedProjects.filter((project) => project.category === category),
      getProjectBySlug: (slug: string) =>
        sortedProjects.find(
          (project) => project.slug === slug || project.slugEn === slug,
        ),
      getProjectByLocalizedSlug: (slug: string, lang: Lang) =>
        findProjectByLocalizedSlug(sortedProjects, slug, lang),
      refetch,
    };
  }, [error, isLoading, projects, refetch, source]);

  return (
    <PublicContentContext.Provider value={value}>
      {children}
    </PublicContentContext.Provider>
  );
};

export { PublicContentContext };
