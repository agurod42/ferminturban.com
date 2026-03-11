import { lazy, type ComponentType, type LazyExoticComponent } from "react";

const chunkReloadPrefix = "lazy-route-reload";

const getImportErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return String(error);
};

const isRecoverableChunkError = (error: unknown) => {
  const message = getImportErrorMessage(error).toLowerCase();

  return [
    "failed to fetch dynamically imported module",
    "error loading dynamically imported module",
    "importing a module script failed",
    "loading chunk",
    "valid javascript mime type",
  ].some((candidate) => message.includes(candidate));
};

const getReloadKey = () => `${chunkReloadPrefix}:${window.location.pathname}`;

export const lazyRoute = <T extends ComponentType<unknown>>(
  importer: () => Promise<{ default: T }>,
): LazyExoticComponent<T> =>
  lazy(async () => {
    try {
      const module = await importer();

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(getReloadKey());
      }

      return module;
    } catch (error) {
      if (
        typeof window !== "undefined" &&
        isRecoverableChunkError(error) &&
        !window.sessionStorage.getItem(getReloadKey())
      ) {
        window.sessionStorage.setItem(getReloadKey(), "1");
        window.location.reload();

        return new Promise<never>(() => {});
      }

      throw error;
    }
  });
