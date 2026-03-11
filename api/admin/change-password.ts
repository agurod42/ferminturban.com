import { hashPassword, requireAdminSession, setSessionCookie, verifyPassword } from "../_lib/auth.js";
import { getAdminCredentials, updateAdminPasswordHash } from "../_lib/admin-credentials.js";
import { ApiError, getErrorMessage, getErrorStatus } from "../_lib/errors.js";
import {
  getJsonBody,
  json,
  methodNotAllowed,
  setNoStore,
  type ApiRequest,
  type ApiResponse,
} from "../_lib/http.js";
import { changePasswordSchema } from "../_lib/validation.js";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoStore(res);

  if (req.method !== "POST") {
    methodNotAllowed(res, ["POST"]);
    return;
  }

  const session = await requireAdminSession(req, res);
  if (!session) {
    return;
  }

  try {
    const payload = changePasswordSchema.parse(getJsonBody(req));
    const credentials = (await getAdminCredentials()).data;
    const currentPasswordMatches = await verifyPassword(
      payload.currentPassword,
      credentials.passwordHash,
    );

    if (!currentPasswordMatches) {
      throw new ApiError(401, "Current password is incorrect");
    }

    if (payload.currentPassword === payload.newPassword) {
      throw new ApiError(400, "New password must be different from the current password");
    }

    const nextPasswordHash = await hashPassword(payload.newPassword);
    const updatedCredentials = (await updateAdminPasswordHash(nextPasswordHash)).data;
    const nextSession = setSessionCookie(res, updatedCredentials);

    json(res, 200, {
      session: {
        authenticated: true,
        email: updatedCredentials.email,
        expiresAt: nextSession.expiresAt,
      },
      message: "Password updated",
    });
  } catch (error) {
    json(res, getErrorStatus(error, 500), {
      error: getErrorMessage(error, "Password change failed"),
    });
  }
}
