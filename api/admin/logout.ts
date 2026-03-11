import { clearSessionCookie } from "../_lib/auth";
import { json, methodNotAllowed, setNoStore, type ApiRequest, type ApiResponse } from "../_lib/http";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoStore(res);

  if (req.method !== "POST") {
    methodNotAllowed(res, ["POST"]);
    return;
  }

  clearSessionCookie(res);
  json(res, 200, {
    session: {
      authenticated: false,
    },
  });
}
