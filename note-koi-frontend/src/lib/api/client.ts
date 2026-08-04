export interface ApiError extends Error {
  status?: number;
  code?: string;
  body?: unknown;
}

function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function request<T = unknown>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const isMutating = !["GET", "HEAD", "OPTIONS"].includes(method);

  // Destructure headers out of init so spreading initRest below doesn't
  // accidentally overwrite the merged headers object (the old bug).
  const { headers: initHeaders, ...initRest } = init ?? {};

  const csrfToken = isMutating ? getCsrfToken() : null;

  const res = await fetch(String(input), {
    credentials: "include",
    ...initRest,
    headers: {
      Accept: "application/json",
      ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
      ...(initHeaders as Record<string, string> | undefined),
    },
  });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // non-json response
  }

  if (res.status === 401) {
    const err = new Error("Unauthorized") as ApiError;
    err.status = 401;
    throw err;
  }

  if (!res.ok) {
    const errObj =
      typeof body === "object" && body !== null && "error" in body
        ? (body as { error?: { message?: string; code?: string } }).error
        : undefined;
    const message = errObj?.message || res.statusText || "API error";
    const err = new Error(message) as ApiError;
    err.status = res.status;
    err.code = errObj?.code;
    err.body = body;
    throw err;
  }

  if (typeof body === "object" && body !== null && "success" in body) {
    const envelope = body as {
      success: boolean;
      data?: unknown;
      error?: { message?: string; code?: string };
    };
    if (envelope.success === false) {
      const err = new Error(envelope.error?.message || "API error") as ApiError;
      err.code = envelope.error?.code;
      err.body = body;
      throw err;
    }
    return envelope.data as T;
  }

  return (body ?? null) as T;
}
