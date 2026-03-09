const IMGPROXY_BASE = "https://imgproxy.thewisemonkey.co.uk";

type ImgproxyMode = "fill" | "fit";

type ImgproxyOptions = {
  width: number;
  height: number;
  mode?: ImgproxyMode;
  format?: "webp" | "jpg" | "png";
};

type ResponsiveImageOptions = {
  aspectRatio?: number;
  widths?: number[];
  sizes?: string;
  mode?: ImgproxyMode;
  format?: "webp" | "jpg" | "png";
};

type ResponsiveImage = {
  src: string;
  srcSet?: string;
  sizes: string;
  width: number;
  height: number;
};

const DEFAULT_WIDTHS = [480, 720, 960, 1280, 1600];

const isRemoteImage = (sourceUrl: string) => /^https?:\/\//i.test(sourceUrl);

export const getOptimizedImageUrl = (
  sourceUrl: string | undefined,
  {
    width,
    height,
    mode = "fill",
    format = "webp",
  }: ImgproxyOptions,
) => {
  if (!sourceUrl) {
    return undefined;
  }

  if (!isRemoteImage(sourceUrl)) {
    return sourceUrl;
  }

  const safeWidth = Math.max(1, Math.round(width));
  const safeHeight = Math.max(1, Math.round(height));
  const encodedSource = encodeURIComponent(sourceUrl);

  return `${IMGPROXY_BASE}/insecure/rs:${mode}:${safeWidth}:${safeHeight}:0/plain/${encodedSource}@${format}`;
};

export const getResponsiveImageSet = (
  sourceUrl: string | undefined,
  {
    aspectRatio = 16 / 9,
    widths = DEFAULT_WIDTHS,
    sizes = "100vw",
    mode = "fill",
    format = "webp",
  }: ResponsiveImageOptions = {},
): ResponsiveImage | null => {
  if (!sourceUrl) {
    return null;
  }

  const safeAspectRatio = aspectRatio > 0 ? aspectRatio : 16 / 9;
  const candidateWidths = [...new Set(widths.map((width) => Math.max(1, Math.round(width))))].sort(
    (left, right) => left - right,
  );
  const candidates = candidateWidths.map((width) => ({
    width,
    height: Math.max(1, Math.round(width / safeAspectRatio)),
  }));
  const largest = candidates[candidates.length - 1];

  if (!isRemoteImage(sourceUrl)) {
    return {
      src: sourceUrl,
      sizes,
      width: largest.width,
      height: largest.height,
    };
  }

  return {
    src: getOptimizedImageUrl(sourceUrl, {
      width: largest.width,
      height: largest.height,
      mode,
      format,
    }) ?? sourceUrl,
    srcSet: candidates
      .map((candidate) => {
        const candidateUrl = getOptimizedImageUrl(sourceUrl, {
          width: candidate.width,
          height: candidate.height,
          mode,
          format,
        });

        return candidateUrl ? `${candidateUrl} ${candidate.width}w` : null;
      })
      .filter((candidate): candidate is string => Boolean(candidate))
      .join(", "),
    sizes,
    width: largest.width,
    height: largest.height,
  };
};
