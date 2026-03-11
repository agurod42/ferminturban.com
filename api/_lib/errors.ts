import { ZodError } from "zod";

export class ApiError extends Error {
  statusCode: number;
  expose: boolean;

  constructor(statusCode: number, message: string, options?: { expose?: boolean }) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.expose = options?.expose ?? statusCode < 500;
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Conflict") {
    super(409, message);
    this.name = "ConflictError";
  }
}

export class ConfigurationError extends ApiError {
  constructor(message = "Server configuration error") {
    super(500, message, { expose: true });
    this.name = "ConfigurationError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not found") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export const getErrorStatus = (error: unknown, fallbackStatus = 500) => {
  if (error instanceof ApiError) {
    return error.statusCode;
  }

  if (error instanceof ZodError) {
    return 400;
  }

  return fallbackStatus;
};

export const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof ApiError) {
    return error.expose ? error.message : fallbackMessage;
  }

  if (error instanceof ZodError) {
    return error.issues[0]?.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return fallbackMessage;
  }

  return fallbackMessage;
};
