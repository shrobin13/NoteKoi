import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  body?: unknown;
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "object" && error !== null) {
    const maybe = error as ApiError;
    if (typeof maybe.message === "string") {
      return maybe.message;
    }
    if (typeof maybe.status === "number") {
      return `Error ${maybe.status}`;
    }
  }

  return fallback;
}
