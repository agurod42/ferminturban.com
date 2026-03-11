import type { Lang, ProjectCategory } from "../src/types/project";
import { listPublicProjects } from "./_lib/content-store";
import {
  getQueryValue,
  json,
  methodNotAllowed,
  setPublicApiCache,
  type ApiRequest,
  type ApiResponse,
} from "./_lib/http";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET"]);
    return;
  }

  try {
    setPublicApiCache(res);
    const category = getQueryValue(req, "category") as ProjectCategory | undefined;
    const lang = (getQueryValue(req, "lang") as Lang | undefined) || "es";
    const response = await listPublicProjects({ category, lang, status: "published" });

    json(res, 200, {
      projects: response.data,
      source: response.source,
      syncedAt: response.syncedAt,
    });
  } catch (error) {
    json(res, 500, {
      error: error instanceof Error ? error.message : "Failed to load projects",
    });
  }
}
