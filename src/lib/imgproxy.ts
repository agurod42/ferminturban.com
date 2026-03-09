import { hmac } from "@noble/hashes/hmac.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { concatBytes, hexToBytes, utf8ToBytes } from "@noble/hashes/utils.js";

const IMGPROXY_BASE = __IMGPROXY_BASE__;
const IMGPROXY_KEY_HEX = __IMGPROXY_KEY__.trim();
const IMGPROXY_SALT_HEX = __IMGPROXY_SALT__.trim();
const IMGPROXY_SIGNATURE_SIZE = Number.parseInt(__IMGPROXY_SIGNATURE_SIZE__, 10);

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

const normalizeHexConfig = (value: string, label: string) => {
  if (!value) {
    return undefined;
  }

  try {
    return hexToBytes(value);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    throw new Error(`Invalid ${label} hex value: ${message}`);
  }
};

if ((IMGPROXY_KEY_HEX && !IMGPROXY_SALT_HEX) || (!IMGPROXY_KEY_HEX && IMGPROXY_SALT_HEX)) {
  throw new Error("Imgproxy signing requires both IMGPROXY_KEY and IMGPROXY_SALT.");
}

const IMGPROXY_KEY = normalizeHexConfig(IMGPROXY_KEY_HEX, "IMGPROXY_KEY");
const IMGPROXY_SALT = normalizeHexConfig(IMGPROXY_SALT_HEX, "IMGPROXY_SALT");
const HAS_IMGPROXY_SIGNATURE = Boolean(IMGPROXY_KEY && IMGPROXY_SALT);
const SIGNATURE_SIZE = Number.isFinite(IMGPROXY_SIGNATURE_SIZE) && IMGPROXY_SIGNATURE_SIZE > 0
  ? Math.min(32, Math.trunc(IMGPROXY_SIGNATURE_SIZE))
  : 32;

let didWarnAboutUnsignedImgproxy = false;

const toBase64Url = (bytes: Uint8Array) => {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const getImgproxySignature = (path: string) => {
  if (!HAS_IMGPROXY_SIGNATURE || !IMGPROXY_KEY || !IMGPROXY_SALT) {
    if (import.meta.env.DEV && !didWarnAboutUnsignedImgproxy) {
      console.warn("Imgproxy signing is disabled because IMGPROXY_KEY/IMGPROXY_SALT are not set.");
      didWarnAboutUnsignedImgproxy = true;
    }

    return "insecure";
  }

  const digest = hmac(sha256, IMGPROXY_KEY, concatBytes(IMGPROXY_SALT, utf8ToBytes(path)));

  return toBase64Url(digest.subarray(0, SIGNATURE_SIZE));
};

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
  const path = `/rs:${mode}:${safeWidth}:${safeHeight}:0/plain/${encodedSource}@${format}`;
  const signature = getImgproxySignature(path);

  return `${IMGPROXY_BASE}/${signature}${path}`;
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
