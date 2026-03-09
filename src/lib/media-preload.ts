import type { Project } from "@/data/projects";
import { getOptimizedImageUrl } from "@/lib/imgproxy";

type FetchPriority = "high" | "low" | "auto";

const imageCache = new Set<string>();
const prefetchCache = new Set<string>();
const preconnectCache = new Set<string>();

const getConnection = () => {
  if (typeof navigator === "undefined") {
    return null;
  }

  return (
    (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
      mozConnection?: { saveData?: boolean; effectiveType?: string };
      webkitConnection?: { saveData?: boolean; effectiveType?: string };
    }).connection ??
    (navigator as Navigator & {
      mozConnection?: { saveData?: boolean; effectiveType?: string };
    }).mozConnection ??
    (navigator as Navigator & {
      webkitConnection?: { saveData?: boolean; effectiveType?: string };
    }).webkitConnection ??
    null
  );
};

export const canAggressivelyPreload = () => {
  const connection = getConnection();
  if (!connection) {
    return true;
  }

  if (connection.saveData) {
    return false;
  }

  return !String(connection.effectiveType || "").includes("2g");
};

const ensureHeadLink = (
  rel: string,
  href: string,
  attrs: Record<string, string> = {},
) => {
  if (typeof document === "undefined" || !href) {
    return;
  }

  const cacheKey = [rel, href, attrs.as || "", attrs.crossorigin || ""].join("|");
  if (rel === "preconnect" || rel === "dns-prefetch") {
    if (preconnectCache.has(cacheKey)) {
      return;
    }
    preconnectCache.add(cacheKey);
  } else if (prefetchCache.has(cacheKey)) {
    return;
  } else {
    prefetchCache.add(cacheKey);
  }

  const link = document.createElement("link");
  link.rel = rel;
  link.href = href;

  Object.entries(attrs).forEach(([key, value]) => {
    link.setAttribute(key, value);
  });

  document.head.appendChild(link);
};

export const preconnectOrigins = (origins: string[]) => {
  origins.forEach((origin) => {
    ensureHeadLink("dns-prefetch", origin);
    ensureHeadLink("preconnect", origin, { crossorigin: "" });
  });
};

export const preloadImage = (
  url: string | undefined,
  priority: FetchPriority = "auto",
) => {
  if (!url || typeof window === "undefined") {
    return;
  }

  if (!imageCache.has(url)) {
    imageCache.add(url);

    const image = new Image();
    image.decoding = "async";
    image.fetchPriority = priority;
    image.src = url;
  }

  ensureHeadLink("preload", url, {
    as: "image",
    fetchpriority: priority,
  });
};

export const prefetchDocument = (url: string | undefined) => {
  if (!url || typeof document === "undefined") {
    return;
  }

  ensureHeadLink("prefetch", url, {
    as: "document",
  });
};

export const scheduleIdle = (task: () => void) => {
  if (typeof window === "undefined") {
    return;
  }

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(task, { timeout: 1200 });
    return;
  }

  window.setTimeout(task, 350);
};

export const warmVideoProvider = (
  provider: string | undefined,
  videoUrl: string | undefined,
) => {
  if (provider === "vimeo") {
    preconnectOrigins([
      "https://player.vimeo.com",
      "https://i.vimeocdn.com",
      "https://f.vimeocdn.com",
    ]);
  }

  if (provider === "youtube") {
    preconnectOrigins([
      "https://www.youtube.com",
      "https://i.ytimg.com",
      "https://www.google.com",
    ]);
  }

  if (videoUrl) {
    prefetchDocument(videoUrl);
  }
};

export const preloadProjectMedia = (
  project: Project | null | undefined,
  options: {
    includeGallery?: boolean;
    priority?: FetchPriority;
  } = {},
) => {
  if (!project) {
    return;
  }

  const includeGallery = options.includeGallery ?? false;
  const priority = options.priority ?? "low";
  const thumbnailAspectRatio = project.thumbnailAspectRatio ?? 16 / 9;

  preconnectOrigins([
    "https://assets.zyrosite.com",
    "https://imgproxy.thewisemonkey.co.uk",
  ]);

  preloadImage(
    getOptimizedImageUrl(project.thumbnailUrl, {
      width: 1280,
      height: Math.round(1280 / thumbnailAspectRatio),
      mode: "fill",
    }) ?? project.thumbnailUrl,
    priority,
  );

  if (project.backgroundUrl && project.backgroundUrl !== project.thumbnailUrl) {
    preloadImage(
      getOptimizedImageUrl(project.backgroundUrl, {
        width: 1600,
        height: Math.round(1600 / thumbnailAspectRatio),
        mode: "fill",
      }) ?? project.backgroundUrl,
      priority,
    );
  }

  warmVideoProvider(project.mediaProvider, project.videoUrl);

  if (!includeGallery || !project.gallery?.length) {
    return;
  }

  const maxImages = canAggressivelyPreload() ? 6 : 2;
  project.gallery.slice(0, maxImages).forEach((imageUrl, index) => {
    preloadImage(
      getOptimizedImageUrl(imageUrl, {
        width: 1280,
        height: 720,
        mode: "fill",
      }) ?? imageUrl,
      index === 0 ? priority : "low",
    );
  });
};
