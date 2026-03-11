import { useCallback, useEffect, useState } from "react";
import { apiJson } from "@/lib/api";
import type { AdminProject, AdminProjectsApiResponse } from "@/types/project";

export const useAdminProjects = () => {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<AdminProjectsApiResponse["source"] | null>(null);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);

  const refreshProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const payload = await apiJson<AdminProjectsApiResponse>("/api/admin/projects");
      setProjects(payload.projects || []);
      setSource(payload.source);
      setSyncedAt(payload.syncedAt);
      setError(null);
    } catch (caughtError) {
      setProjects([]);
      setSource(null);
      setSyncedAt(null);
      setError(caughtError instanceof Error ? caughtError.message : "Failed to load projects.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProjects();
  }, [refreshProjects]);

  return {
    projects,
    setProjects,
    isLoading,
    error,
    source,
    syncedAt,
    refreshProjects,
  };
};
