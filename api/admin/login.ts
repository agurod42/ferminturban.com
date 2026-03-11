import {
  setSessionCookie,
  verifyPassword,
} from "../_lib/auth.js";
import { getAdminCredentials } from "../_lib/admin-credentials.js";
import { getErrorMessage, getErrorStatus } from "../_lib/errors.js";
import {
  getJsonBody,
  json,
  methodNotAllowed,
  setNoStore,
  type ApiRequest,
  type ApiResponse,
} from "../_lib/http.js";
import { loginSchema } from "../_lib/validation.js";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoStore(res);

  if (req.method !== "POST") {
    methodNotAllowed(res, ["POST"]);
    return;
  }

  try {
    const payload = loginSchema.parse(getJsonBody(req));
    const credentials = (await getAdminCredentials()).data;
    const email = credentials.email;
    const hash = credentials.passwordHash;
    const isMatch =
      payload.email.toLowerCase() === email.toLowerCase() &&
      (await verifyPassword(payload.password, hash));

    if (!isMatch) {
      json(res, 401, { error: "Invalid credentials" });
      return;
    }

    const session = setSessionCookie(res, credentials);
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
