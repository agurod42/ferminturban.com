import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { put } from "@vercel/blob";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const LOCAL_UPLOAD_DIR = path.join(PROJECT_ROOT, "public", "uploads");

const dataUrlPattern = /^data:([^;,]+);base64,(.+)$/;

const getFileExtension = (filename: string, contentType: string) => {
  const existing = path.extname(filename).replace(/^\./, "");
  if (existing) {
    return existing;
  }

  const fallbacks: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
    "image/svg+xml": "svg",
  };

  return fallbacks[contentType] || "bin";
};

const decodeDataUrl = (value: string) => {
  const match = value.match(dataUrlPattern);
  if (!match) {
    throw new Error("Invalid dataUrl payload");
  }

  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
};

const sanitizeFolder = (folder?: string) => {
  if (!folder) {
    return undefined;
  }

  const normalized = folder
    .split("/")
    .map((segment) => segment.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, "-"))
    .map((segment) => segment.replace(/^-+|-+$/g, ""))
    .filter(Boolean)
    .join("/");

  return normalized || undefined;
};

export const uploadAsset = async (
  filename: string,
  contentType: string | undefined,
  dataUrl: string,
  folder?: string,
) => {
  const decoded = decodeDataUrl(dataUrl);
  const extension = getFileExtension(filename, contentType || decoded.contentType);
  const assetId = randomUUID();
  const baseFolder = sanitizeFolder(folder) || `projects/${new Date().getUTCFullYear()}`;
  const objectPath = `${baseFolder}/${assetId}.${extension}`;
  const resolvedContentType = contentType || decoded.contentType;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(objectPath, decoded.buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: resolvedContentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: resolvedContentType,
      size: decoded.buffer.byteLength,
      source: "blob" as const,
    };
  }

  if (process.env.VERCEL) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required for uploads on Vercel");
  }

  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  const localRelativePath = path.posix.join("uploads", baseFolder, `${assetId}.${extension}`);
  const absolutePath = path.join(PROJECT_ROOT, "public", ...localRelativePath.split("/"));
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, decoded.buffer);

  return {
    url: `/${localRelativePath.replace(/\\/g, "/")}`,
    pathname: `/${localRelativePath.replace(/\\/g, "/")}`,
    contentType: resolvedContentType,
    size: decoded.buffer.byteLength,
    source: "local" as const,
  };
};
