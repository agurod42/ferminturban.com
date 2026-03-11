export type ApiRequest = {
  method?: string;
  query: Record<string, string | string[] | undefined>;
  body?: unknown;
  headers: Record<string, string | undefined>;
};

export type ApiResponse = {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string | string[]) => void;
  json: (body: unknown) => void;
};

export const json = (res: ApiResponse, statusCode: number, body: unknown) => {
  res.status(statusCode);
  res.json(body);
};

export const setCacheControl = (res: ApiResponse, value: string) => {
  res.setHeader("Cache-Control", value);
};

export const setPublicApiCache = (res: ApiResponse) => {
  setCacheControl(res, "public, max-age=0, s-maxage=60, stale-while-revalidate=600");
};

export const setNoStore = (res: ApiResponse) => {
  setCacheControl(res, "no-store");
};

export const methodNotAllowed = (res: ApiResponse, allowed: string[]) => {
  res.setHeader("Allow", allowed.join(", "));
  json(res, 405, { error: "Method not allowed" });
};

export const getQueryValue = (
  req: ApiRequest,
  key: string,
) => {
  const value = req.query[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

export const getJsonBody = <T>(req: ApiRequest): T => {
  if (typeof req.body === "string") {
    return JSON.parse(req.body) as T;
  }

  return (req.body ?? {}) as T;
};
