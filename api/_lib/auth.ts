import {
  createHmac,
  randomBytes,
  scrypt as nodeScrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { ConfigurationError } from "./errors.js";
import type { ApiRequest, ApiResponse } from "./http.js";
import { json } from "./http.js";

const scrypt = promisify(nodeScrypt);
const SESSION_COOKIE_NAME = "ft_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type SessionPayload = {
  email: string;
  exp: number;
};

const getRequiredEnv = (key: string) => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new ConfigurationError(`Missing required environment variable: ${key}`);
  }
  return value;
};

const toBase64Url = (value: Buffer | string) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const fromBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64");
};

const sign = (value: string) =>
  toBase64Url(createHmac("sha256", getRequiredEnv("SESSION_SECRET")).update(value).digest());

const parseCookies = (header: string | undefined) => {
  if (!header) {
    return {};
  }

  return Object.fromEntries(
    header
      .split(";")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [name, ...rest] = entry.split("=");
        return [name, decodeURIComponent(rest.join("="))];
      }),
  );
};

const serializeCookie = (
  name: string,
  value: string,
  options: {
    maxAge?: number;
    expires?: Date;
  } = {},
) => {
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", "HttpOnly", "SameSite=Lax"];

  if (process.env.NODE_ENV !== "development") {
    parts.push("Secure");
  }

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.expires) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }

  return parts.join("; ");
};

export const hashPassword = async (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
};

export const verifyPassword = async (password: string, storedHash: string) => {
  const [algorithm, salt, hash] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !hash) {
    throw new Error("Unsupported ADMIN_PASSWORD_HASH format");
  }

  const derived = (await scrypt(password, salt, Buffer.from(hash, "hex").length)) as Buffer;
  return timingSafeEqual(derived, Buffer.from(hash, "hex"));
};

export const createSessionToken = (email: string) => {
  const payload: SessionPayload = {
    email,
    exp: Date.now() + SESSION_TTL_MS,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
};

export const readSession = (req: ApiRequest) => {
  const cookieValue = parseCookies(req.headers.cookie)[SESSION_COOKIE_NAME];
  if (!cookieValue) {
    return null;
  }

  const [encodedPayload, encodedSignature] = cookieValue.split(".");
  if (!encodedPayload || !encodedSignature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const actualBuffer = Buffer.from(encodedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  const payload = JSON.parse(fromBase64Url(encodedPayload).toString("utf8")) as SessionPayload;
  if (!payload.email || payload.exp <= Date.now()) {
    return null;
  }

  return payload;
};

export const setSessionCookie = (res: ApiResponse, email: string) => {
  const token = createSessionToken(email);
  res.setHeader(
    "Set-Cookie",
    serializeCookie(SESSION_COOKIE_NAME, token, {
      maxAge: Math.floor(SESSION_TTL_MS / 1000),
    }),
  );

  return {
    token,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };
};

export const clearSessionCookie = (res: ApiResponse) => {
  res.setHeader(
    "Set-Cookie",
    serializeCookie(SESSION_COOKIE_NAME, "", {
      expires: new Date(0),
      maxAge: 0,
    }),
  );
};

export const requireAdminSession = (req: ApiRequest, res: ApiResponse) => {
  let session = null;

  try {
    session = readSession(req);
  } catch (error) {
    json(res, 500, {
      error: error instanceof Error ? error.message : "Failed to validate admin session",
    });
    return null;
  }

  if (!session) {
    json(res, 401, { error: "Unauthorized" });
    return null;
  }

  return session;
};

export const getConfiguredAdminEmail = () => getRequiredEnv("ADMIN_EMAIL");
export const getConfiguredAdminHash = () => getRequiredEnv("ADMIN_PASSWORD_HASH");

export const getSessionExpiry = (req: ApiRequest) => readSession(req)?.exp;
