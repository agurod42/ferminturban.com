const isEnabled = (value?: string) => value?.trim().toLowerCase() === "true";

export const featuredProjectsEnabled = isEnabled(
  import.meta.env.VITE_ENABLE_FEATURED_PROJECTS,
);
