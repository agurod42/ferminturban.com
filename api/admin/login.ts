import {
  getConfiguredAdminEmail,
  getConfiguredAdminHash,
  setSessionCookie,
  verifyPassword,
} from "../_lib/auth";
import { getErrorMessage, getErrorStatus } from "../_lib/errors";
import {
  getJsonBody,
  json,
  methodNotAllowed,
  setNoStore,
  type ApiRequest,
  type ApiResponse,
} from "../_lib/http";
import { loginSchema } from "../_lib/validation";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoStore(res);

  if (req.method !== "POST") {
    methodNotAllowed(res, ["POST"]);
    return;
  }

  try {
    const payload = loginSchema.parse(getJsonBody(req));
    const email = getConfiguredAdminEmail();
    const hash = getConfiguredAdminHash();
    const isMatch =
      payload.email.toLowerCase() === email.toLowerCase() &&
      (await verifyPassword(payload.password, hash));

    if (!isMatch) {
      json(res, 401, { error: "Invalid credentials" });
      return;
    }

    const session = setSessionCookie(res, email);
    json(res, 200, {
      session: {
        authenticated: true,
        email,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    json(res, getErrorStatus(error, 500), {
      error: getErrorMessage(error, "Login failed"),
    });
  }
}
