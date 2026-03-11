import { requireAdminSession } from "../_lib/auth.js";
import { getErrorMessage, getErrorStatus } from "../_lib/errors.js";
import {
  getJsonBody,
  json,
  methodNotAllowed,
  setNoStore,
  type ApiRequest,
  type ApiResponse,
} from "../_lib/http.js";
import { uploadAsset } from "../_lib/storage.js";
import { uploadSchema } from "../_lib/validation.js";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoStore(res);

  const session = requireAdminSession(req, res);
  if (!session) {
    return;
  }

  if (req.method !== "POST") {
    methodNotAllowed(res, ["POST"]);
    return;
  }

  try {
    const payload = uploadSchema.parse(getJsonBody(req));
    const uploaded = await uploadAsset(
      payload.filename,
      payload.contentType,
      payload.dataUrl,
      payload.folder,
    );
    json(res, 200, uploaded);
  } catch (error) {
    json(res, getErrorStatus(error, 500), {
      error: getErrorMessage(error, "Upload failed"),
    });
  }
}
