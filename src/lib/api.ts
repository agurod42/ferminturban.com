type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
};

const appendQuery = (url: URL, query?: ApiFetchOptions["query"]) => {
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });
};

const parseJsonSafely = (text: string) => {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const getNonJsonApiError = (
  requestUrl: string,
  contentType: string,
  text: string,
) => {
  const pathname = (() => {
    try {
      return new URL(requestUrl, window.location.origin).pathname;
    } catch {
      return String(requestUrl);
    }
  })();

  const trimmed = text.trim();
  const snippet = trimmed.slice(0, 120);

  if (
    pathname.startsWith("/api/") &&
    (contentType.includes("javascript") ||
      trimmed.startsWith("import ") ||
      trimmed.startsWith("export ") ||
      trimmed.startsWith("async function"))
  ) {
    return `The API is not running. Use "npx vercel dev" for admin/API routes instead of "npm run dev".`;
  }

  if (pathname.startsWith("/api/") && contentType.includes("text/html")) {
    return `The API returned HTML instead of JSON for ${pathname}. Use "npx vercel dev" locally or check your Vercel routing.`;
  }

  return `Expected JSON from ${pathname}, received ${contentType || "unknown content"}${snippet ? `: ${snippet}` : ""}`;
};

export async function apiJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  const text = await response.text();
  const requestUrl = typeof input === "string" ? input : input.toString();
  const contentType = response.headers.get("content-type") || "";
  const payload = parseJsonSafely(text);

  if (text && payload === null) {
    throw new Error(getNonJsonApiError(requestUrl, contentType, text));
  }

  if (!response.ok) {
    const message =
      payload?.error || payload?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export async function apiFetch<T>(
  input: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const url = new URL(input, window.location.origin);
  appendQuery(url, options.query);

  return apiJson<T>(url.toString(), {
    ...options,
    body: typeof options.body === "undefined"
      ? undefined
      : JSON.stringify(options.body),
  });
}
