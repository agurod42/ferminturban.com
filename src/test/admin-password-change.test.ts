// @vitest-environment node

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes, scryptSync } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

const createPasswordHash = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
};

const createMockResponse = () => {
  let statusCode = 200;
  let body: unknown;
  const headers = new Map<string, string | string[]>();

  const response = {
    status(code: number) {
      statusCode = code;
      return response;
    },
    setHeader(name: string, value: string | string[]) {
      headers.set(name, value);
    },
    json(payload: unknown) {
      body = payload;
    },
  };

  return {
    response,
    getStatusCode: () => statusCode,
    getBody: () => body,
    getHeader: (name: string) => headers.get(name),
  };
};

const getCookieHeader = (header: string | string[] | undefined) => {
  const raw = Array.isArray(header) ? header[0] : header;
  return raw?.split(";")[0] || "";
};

const createIsolatedEnv = async (password: string) => {
  const directory = await mkdtemp(path.join(tmpdir(), "ferminturban-auth-"));

  process.env.ADMIN_EMAIL = "owner@example.com";
  process.env.ADMIN_PASSWORD_HASH = createPasswordHash(password);
  process.env.SESSION_SECRET = "test-session-secret";
  process.env.ADMIN_CREDENTIALS_FILE_PATH = path.join(directory, "admin-credentials.json");
  delete process.env.DATABASE_URL;

  return directory;
};

describe("admin password change", () => {
  const tempDirectories: string[] = [];

  afterEach(async () => {
    vi.resetModules();
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD_HASH;
    delete process.env.SESSION_SECRET;
    delete process.env.ADMIN_CREDENTIALS_FILE_PATH;
    delete process.env.DATABASE_URL;

    while (tempDirectories.length > 0) {
      const directory = tempDirectories.pop();
      if (directory) {
        await rm(directory, { recursive: true, force: true });
      }
    }
  });

  it("persists the new password and invalidates older session cookies", async () => {
    const currentPassword = "current-password-123";
    const nextPassword = "replacement-password-456";
    const directory = await createIsolatedEnv(currentPassword);
    tempDirectories.push(directory);

    const [{ getAdminCredentials }, authModule, changePasswordHandlerModule] = await Promise.all([
      import("../../api/_lib/admin-credentials.ts"),
      import("../../api/_lib/auth.ts"),
      import("../../api/admin/change-password.ts"),
    ]);

    const { readSession, setSessionCookie, verifyPassword } = authModule;
    const changePasswordHandler = changePasswordHandlerModule.default;
    const credentials = (await getAdminCredentials()).data;
    const initialSession = createMockResponse();
    setSessionCookie(initialSession.response as never, credentials);
    const staleCookie = getCookieHeader(initialSession.getHeader("Set-Cookie"));

    const response = createMockResponse();
    await changePasswordHandler(
      {
        method: "POST",
        query: {},
        headers: { cookie: staleCookie },
        body: JSON.stringify({
          currentPassword,
          newPassword: nextPassword,
          confirmPassword: nextPassword,
        }),
      },
      response.response as never,
    );

    expect(response.getStatusCode()).toBe(200);
    expect(response.getBody()).toMatchObject({
      session: {
        authenticated: true,
        email: "owner@example.com",
      },
      message: "Password updated",
    });

    const storedCredentials = (await getAdminCredentials()).data;
    expect(storedCredentials.sessionVersion).toBe(credentials.sessionVersion + 1);
    expect(await verifyPassword(nextPassword, storedCredentials.passwordHash)).toBe(true);
    expect(await verifyPassword(currentPassword, storedCredentials.passwordHash)).toBe(false);

    const staleSession = await readSession({
      method: "GET",
      query: {},
      headers: { cookie: staleCookie },
    });
    expect(staleSession).toBeNull();

    const refreshedCookie = getCookieHeader(response.getHeader("Set-Cookie"));
    const refreshedSession = await readSession({
      method: "GET",
      query: {},
      headers: { cookie: refreshedCookie },
    });
    expect(refreshedSession?.email).toBe("owner@example.com");
  });

  it("rejects an incorrect current password without rotating the credential version", async () => {
    const currentPassword = "current-password-123";
    const directory = await createIsolatedEnv(currentPassword);
    tempDirectories.push(directory);

    const [{ getAdminCredentials }, authModule, changePasswordHandlerModule] = await Promise.all([
      import("../../api/_lib/admin-credentials.ts"),
      import("../../api/_lib/auth.ts"),
      import("../../api/admin/change-password.ts"),
    ]);

    const { readSession, setSessionCookie, verifyPassword } = authModule;
    const changePasswordHandler = changePasswordHandlerModule.default;
    const credentials = (await getAdminCredentials()).data;
    const initialSession = createMockResponse();
    setSessionCookie(initialSession.response as never, credentials);
    const cookie = getCookieHeader(initialSession.getHeader("Set-Cookie"));

    const response = createMockResponse();
    await changePasswordHandler(
      {
        method: "POST",
        query: {},
        headers: { cookie },
        body: JSON.stringify({
          currentPassword: "wrong-password-999",
          newPassword: "replacement-password-456",
          confirmPassword: "replacement-password-456",
        }),
      },
      response.response as never,
    );

    expect(response.getStatusCode()).toBe(401);
    expect(response.getBody()).toEqual({
      error: "Current password is incorrect",
    });

    const storedCredentials = (await getAdminCredentials()).data;
    expect(storedCredentials.sessionVersion).toBe(credentials.sessionVersion);
    expect(await verifyPassword(currentPassword, storedCredentials.passwordHash)).toBe(true);

    const currentSession = await readSession({
      method: "GET",
      query: {},
      headers: { cookie },
    });
    expect(currentSession?.email).toBe("owner@example.com");
  });
});
