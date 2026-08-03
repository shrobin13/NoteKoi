export interface ApiError extends Error {
  status?: number;
  code?: string;
  body?: unknown;
}

export async function request<T = unknown>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(String(input), {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    },
    ...init,
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
    const errObj = typeof body === "object" && body !== null && "error" in body ? (body as { error?: { message?: string } }).error : undefined;
    const message = errObj?.message || res.statusText || "API error";
    const err = new Error(message) as ApiError;
    err.status = res.status;
    err.body = body;
    throw err;
  }

  if (typeof body === "object" && body !== null && "success" in body) {
    const envelope = body as { success: boolean; data?: unknown; error?: { message?: string; code?: string } };
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
