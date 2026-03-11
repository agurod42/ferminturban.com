import { requireAdminSession } from "../_lib/auth";
import { listAdminProjects, saveAdminProject } from "../_lib/content-store";
import { getErrorMessage, getErrorStatus } from "../_lib/errors";
import {
  getJsonBody,
  json,
  methodNotAllowed,
  setNoStore,
  type ApiRequest,
  type ApiResponse,
} from "../_lib/http";
import { adminProjectInputSchema } from "../_lib/validation";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoStore(res);

  const session = requireAdminSession(req, res);
  if (!session) {
    return;
  }

  if (req.method === "GET") {
    try {
      const response = await listAdminProjects();
      json(res, 200, {
        projects: response.data,
        source: response.source,
        syncedAt: response.syncedAt,
      });
    } catch (error) {
      json(res, getErrorStatus(error, 500), {
        error: getErrorMessage(error, "Failed to load admin projects"),
      });
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const payload = adminProjectInputSchema.parse(getJsonBody(req));
      const response = await saveAdminProject(payload);
      json(res, 201, {
        project: response.data,
        source: response.source,
        syncedAt: response.syncedAt,
      });
    } catch (error) {
      json(res, getErrorStatus(error, 500), {
        error: getErrorMessage(error, "Failed to create project"),
      });
    }
    return;
  }

  methodNotAllowed(res, ["GET", "POST"]);
}
