import { z } from "zod";
import type { AdminProjectInput } from "../../src/types/project.js";

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "slug must contain only lowercase letters, numbers, and hyphens",
  });

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const optionalNumber = z
  .union([z.number(), z.string()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === "") {
      return undefined;
    }

    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  });

const isUrlOrLocalPath = (value: string) =>
  /^https?:\/\//i.test(value) || value.startsWith("/");

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const galleryItemSchema = z.object({
  id: optionalText,
  imageUrl: z.string().trim().refine(isUrlOrLocalPath, {
    message: "imageUrl must be a valid URL or local path",
  }),
  altEs: optionalText,
  altEn: optionalText,
  aspectRatio: optionalNumber,
  position: optionalNumber,
});

export const adminProjectInputSchema = z.object({
  category: z.enum(["publicidad", "documental"]),
  status: z.enum(["draft", "published", "archived"]),
  slugEs: slugSchema,
  slugEn: optionalText.refine(
    (value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.toLowerCase()),
    {
      message: "slugEn must contain only lowercase letters, numbers, and hyphens",
    },
  ).transform((value) => value?.toLowerCase()),
  titleEs: z.string().trim().min(1),
  titleEn: optionalText,
  client: optionalText,
  productora: optionalText,
  director: optionalText,
  dop: optionalText,
  mediaType: z.enum(["video", "image"]).optional(),
  mediaProvider: optionalText,
  videoUrl: optionalText.refine((value) => !value || /^https?:\/\//i.test(value), {
    message: "videoUrl must be a valid URL",
  }),
  featured: z.boolean().default(false),
  sortOrder: optionalNumber.transform((value) => value ?? 0),
  thumbnailUrl: optionalText.refine((value) => !value || isUrlOrLocalPath(value), {
    message: "thumbnailUrl must be a valid URL or local path",
  }),
  thumbnailAltEs: optionalText,
  thumbnailAltEn: optionalText,
  thumbnailAspectRatio: optionalNumber,
  backgroundUrl: optionalText.refine((value) => !value || isUrlOrLocalPath(value), {
    message: "backgroundUrl must be a valid URL or local path",
  }),
  galleryAspectRatio: optionalNumber,
  canonicalUrl: optionalText.refine((value) => !value || /^https?:\/\//i.test(value), {
    message: "canonicalUrl must be a valid URL",
  }),
  sourceUrl: optionalText.refine((value) => !value || /^https?:\/\//i.test(value), {
    message: "sourceUrl must be a valid URL",
  }),
  creditsText: optionalText,
  galleryItems: z.array(galleryItemSchema).default([]),
});

export const parseAdminProjectInput = (value: unknown): AdminProjectInput => {
  const payload = adminProjectInputSchema.parse(value);

  return {
    ...payload,
    featured: payload.featured ?? false,
    sortOrder: payload.sortOrder ?? 0,
    galleryItems: payload.galleryItems ?? [],
  };
};

export const uploadSchema = z.object({
  filename: z.string().trim().min(1),
  contentType: optionalText,
  dataUrl: z.string().trim().startsWith("data:"),
  folder: optionalText,
});
