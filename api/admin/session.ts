import { getSessionExpiry, readSession } from "../_lib/auth.js";
import { getErrorMessage, getErrorStatus } from "../_lib/errors.js";
import { json, methodNotAllowed, setNoStore, type ApiRequest, type ApiResponse } from "../_lib/http.js";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoStore(res);

  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET"]);
    return;
  }

  try {
    const session = readSession(req);
    if (!session) {
      json(res, 200, {
        session: {
          authenticated: false,
        },
      });
      return;
    }

    json(res, 200, {
      session: {
        authenticated: true,
        email: session.email,
        expiresAt: new Date(getSessionExpiry(req) || session.exp).toISOString(),
      },
    });
  } catch (error) {
    json(res, getErrorStatus(error, 500), {
      error: getErrorMessage(error, "Failed to load admin session"),
    });
  }
}
