import { requireAdminSession } from "../_lib/auth.js";
import {
  deleteAdminProject,
  getAdminProject,
  saveAdminProject,
} from "../_lib/content-store.js";
import { getErrorMessage, getErrorStatus } from "../_lib/errors.js";
import {
  getJsonBody,
  getQueryValue,
  json,
  methodNotAllowed,
  setNoStore,
  type ApiRequest,
  type ApiResponse,
} from "../_lib/http.js";
import { parseAdminProjectInput } from "../_lib/validation.js";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoStore(res);

  const session = requireAdminSession(req, res);
  if (!session) {
    return;
  }

  const id = getQueryValue(req, "id");
  if (!id) {
    json(res, 400, { error: "Missing project id" });
    return;
  }

  if (req.method === "GET") {
    try {
      const response = await getAdminProject(id);
      if (!response.data) {
        json(res, 404, {
          error: "Project not found",
          source: response.source,
          syncedAt: response.syncedAt,
        });
        return;
      }

      json(res, 200, {
        project: response.data,
        source: response.source,
        syncedAt: response.syncedAt,
      });
    } catch (error) {
      json(res, getErrorStatus(error, 500), {
        error: getErrorMessage(error, "Failed to load project"),
      });
    }
    return;
  }

  if (req.method === "PATCH") {
    try {
      const payload = parseAdminProjectInput(getJsonBody(req));
      const response = await saveAdminProject(payload, id);
      json(res, 200, {
        project: response.data,
        source: response.source,
        syncedAt: response.syncedAt,
      });
    } catch (error) {
      json(res, getErrorStatus(error, 500), {
        error: getErrorMessage(error, "Failed to update project"),
      });
    }
    return;
  }

  if (req.method === "DELETE") {
    try {
      const response = await deleteAdminProject(id);
      if (!response.data) {
        json(res, 404, {
          error: "Project not found",
          source: response.source,
          syncedAt: response.syncedAt,
        });
        return;
      }

      json(res, 200, {
        deleted: response.data,
        source: response.source,
        syncedAt: response.syncedAt,
      });
    } catch (error) {
      json(res, getErrorStatus(error, 500), {
        error: getErrorMessage(error, "Failed to delete project"),
      });
    }
    return;
  }

  methodNotAllowed(res, ["GET", "PATCH", "DELETE"]);
}
