import { requireAdminSession } from "../_lib/auth.js";
import { listAdminProjects, saveAdminProject } from "../_lib/content-store.js";
import { getErrorMessage, getErrorStatus } from "../_lib/errors.js";
import {
  getJsonBody,
  json,
  methodNotAllowed,
  setNoStore,
  type ApiRequest,
  type ApiResponse,
} from "../_lib/http.js";
import { parseAdminProjectInput } from "../_lib/validation.js";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoStore(res);

  const session = await requireAdminSession(req, res);
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
      const payload = parseAdminProjectInput(getJsonBody(req));
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
