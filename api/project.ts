import type { Lang } from "../src/types/project";
import { getPublicProject } from "./_lib/content-store";
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

  const slug = getQueryValue(req, "slug");
  if (!slug) {
    json(res, 400, { error: "Missing slug" });
    return;
  }

  try {
    setPublicApiCache(res);
    const lang = (getQueryValue(req, "lang") as Lang | undefined) || "es";
    const response = await getPublicProject(slug, lang);
    json(res, 200, {
      project: response.data,
      source: response.source,
      syncedAt: response.syncedAt,
    });
  } catch (error) {
    json(res, 500, {
      error: error instanceof Error ? error.message : "Failed to load project",
    });
  }
}
