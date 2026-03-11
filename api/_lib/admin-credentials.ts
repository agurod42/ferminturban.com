import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { ConfigurationError } from "./errors.js";

type StoreSource = "database" | "file";

type StoreResult<T> = {
  data: T;
  source: StoreSource;
  syncedAt: string;
};

type AdminCredentials = {
  email: string;
  passwordHash: string;
  sessionVersion: number;
  updatedAt: string;
};

type FileStorePayload = AdminCredentials & {
  syncedAt: string;
};

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DEFAULT_FILE_STORE_PATH = path.join(PROJECT_ROOT, ".data", "admin-credentials.json");
const ADMIN_CREDENTIALS_ROW_ID = "default";
let databaseClient: ReturnType<typeof postgres> | null = null;
let databaseReadyPromise: Promise<void> | null = null;

const getSyncedAt = () => new Date().toISOString();

const getRequiredBootstrapEnv = (key: "ADMIN_EMAIL" | "ADMIN_PASSWORD_HASH") => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new ConfigurationError(`Missing required environment variable: ${key}`);
  }

  return value;
};

const getFileStorePath = () => process.env.ADMIN_CREDENTIALS_FILE_PATH || DEFAULT_FILE_STORE_PATH;

const buildBootstrapCredentials = (): AdminCredentials => {
  const timestamp = getSyncedAt();

  return {
    email: getRequiredBootstrapEnv("ADMIN_EMAIL"),
    passwordHash: getRequiredBootstrapEnv("ADMIN_PASSWORD_HASH"),
    sessionVersion: 1,
    updatedAt: timestamp,
  };
};

const getOptionalBootstrapCredentials = (): Partial<AdminCredentials> | null => {
  const email = process.env.ADMIN_EMAIL?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();

  if (!email || !passwordHash) {
    return null;
  }

  return {
    email,
    passwordHash,
    sessionVersion: 1,
    updatedAt: getSyncedAt(),
  };
};

const normalizeCredentials = (payload: Partial<AdminCredentials>): AdminCredentials => {
  const bootstrap = getOptionalBootstrapCredentials();
  const email = payload.email?.trim() || bootstrap?.email;
  const passwordHash = payload.passwordHash?.trim() || bootstrap?.passwordHash;

  if (!email || !passwordHash) {
    throw new ConfigurationError(
      "Admin credentials are not initialized. Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH to bootstrap them.",
    );
  }

  const updatedAt =
    payload.updatedAt && !Number.isNaN(Date.parse(payload.updatedAt))
      ? new Date(payload.updatedAt).toISOString()
      : bootstrap?.updatedAt || getSyncedAt();

  return {
    email,
    passwordHash,
    sessionVersion:
      typeof payload.sessionVersion === "number" && payload.sessionVersion >= 1
        ? Math.floor(payload.sessionVersion)
        : bootstrap?.sessionVersion || 1,
    updatedAt,
  };
};

const isReadOnlyFileStoreError = (error: unknown) => {
  const code = (error as NodeJS.ErrnoException).code;
  return code === "EROFS" || code === "EACCES" || code === "EPERM";
};

const toReadOnlyCredentialsError = () =>
  new ConfigurationError("DATABASE_URL is required for password changes in this deployment");

const readJsonFileStore = async (): Promise<FileStorePayload> => {
  const storePath = getFileStorePath();

  try {
    const content = await readFile(storePath, "utf8");
    const parsed = JSON.parse(content) as Partial<FileStorePayload>;
    const credentials = normalizeCredentials(parsed);

    return {
      ...credentials,
      syncedAt:
        parsed.syncedAt && !Number.isNaN(Date.parse(parsed.syncedAt))
          ? new Date(parsed.syncedAt).toISOString()
          : credentials.updatedAt,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    const initial = {
      ...buildBootstrapCredentials(),
      syncedAt: getSyncedAt(),
    };

    try {
      await writeJsonFileStore(initial);
    } catch (writeError) {
      if (!isReadOnlyFileStoreError(writeError)) {
        throw writeError;
      }
    }

    return initial;
  }
};

const writeJsonFileStore = async (payload: FileStorePayload) => {
  const storePath = getFileStorePath();
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(payload, null, 2));
};

const fileStore = {
  async getCredentials(): Promise<StoreResult<AdminCredentials>> {
    const payload = await readJsonFileStore();

    return {
      data: normalizeCredentials(payload),
      source: "file",
      syncedAt: payload.syncedAt,
    };
  },

  async updatePassword(nextPasswordHash: string): Promise<StoreResult<AdminCredentials>> {
    const current = await readJsonFileStore();
    const currentCredentials = normalizeCredentials(current);
    const nextCredentials: AdminCredentials = {
      email: currentCredentials.email,
      passwordHash: nextPasswordHash,
      sessionVersion: currentCredentials.sessionVersion + 1,
      updatedAt: getSyncedAt(),
    };
    const nextPayload: FileStorePayload = {
      ...nextCredentials,
      syncedAt: nextCredentials.updatedAt,
    };

    try {
      await writeJsonFileStore(nextPayload);
    } catch (error) {
      if (isReadOnlyFileStoreError(error)) {
        throw toReadOnlyCredentialsError();
      }

      throw error;
    }

    return {
      data: nextCredentials,
      source: "file",
      syncedAt: nextPayload.syncedAt,
    };
  },
};

const getDatabaseClient = () => {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!databaseClient) {
    databaseClient = postgres(process.env.DATABASE_URL, {
      prepare: false,
    });
  }

  return databaseClient;
};

const mapDatabaseRow = (row: Record<string, unknown>): AdminCredentials => ({
  email: String(row.email),
  passwordHash: String(row.password_hash),
  sessionVersion: Math.max(1, Number(row.session_version || 1)),
  updatedAt: row.updated_at ? new Date(String(row.updated_at)).toISOString() : getSyncedAt(),
});

const ensureDatabaseReady = async () => {
  const sql = getDatabaseClient();
  if (!sql) {
    return;
  }

  if (!databaseReadyPromise) {
    databaseReadyPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS admin_credentials (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          session_version INTEGER NOT NULL DEFAULT 1,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      const rows = await sql<Record<string, unknown>[]>`
        SELECT *
        FROM admin_credentials
        WHERE id = ${ADMIN_CREDENTIALS_ROW_ID}
        LIMIT 1
      `;

      if (rows.length > 0) {
        return;
      }

      const bootstrap = buildBootstrapCredentials();
      await sql`
        INSERT INTO admin_credentials (
          id,
          email,
          password_hash,
          session_version,
          updated_at
        ) VALUES (
          ${ADMIN_CREDENTIALS_ROW_ID},
          ${bootstrap.email},
          ${bootstrap.passwordHash},
          ${bootstrap.sessionVersion},
          ${bootstrap.updatedAt}
        )
      `;
    })();
  }

  await databaseReadyPromise;
};

const databaseStore = {
  async getCredentials(): Promise<StoreResult<AdminCredentials>> {
    const sql = getDatabaseClient();
    if (!sql) {
      throw new Error("Database not configured");
    }

    await ensureDatabaseReady();
    const rows = await sql<Record<string, unknown>[]>`
      SELECT *
      FROM admin_credentials
      WHERE id = ${ADMIN_CREDENTIALS_ROW_ID}
      LIMIT 1
    `;

    return {
      data: mapDatabaseRow(rows[0]),
      source: "database",
      syncedAt: getSyncedAt(),
    };
  },

  async updatePassword(nextPasswordHash: string): Promise<StoreResult<AdminCredentials>> {
    const sql = getDatabaseClient();
    if (!sql) {
      throw new Error("Database not configured");
    }

    await ensureDatabaseReady();
    const rows = await sql<Record<string, unknown>[]>`
      UPDATE admin_credentials
      SET
        password_hash = ${nextPasswordHash},
        session_version = session_version + 1,
        updated_at = NOW()
      WHERE id = ${ADMIN_CREDENTIALS_ROW_ID}
      RETURNING *
    `;

    return {
      data: mapDatabaseRow(rows[0]),
      source: "database",
      syncedAt: getSyncedAt(),
    };
  },
};

const getStore = () => (process.env.DATABASE_URL ? databaseStore : fileStore);

export type { AdminCredentials, StoreResult as AdminCredentialsStoreResult };

export const getAdminCredentials = async () => getStore().getCredentials();

export const updateAdminPasswordHash = async (nextPasswordHash: string) =>
  getStore().updatePassword(nextPasswordHash);
