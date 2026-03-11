import { requireAdminSession } from "../_lib/auth";
import { getErrorMessage, getErrorStatus } from "../_lib/errors";
import {
  getJsonBody,
  json,
  methodNotAllowed,
  setNoStore,
  type ApiRequest,
  type ApiResponse,
} from "../_lib/http";
import { uploadAsset } from "../_lib/storage";
import { uploadSchema } from "../_lib/validation";

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
