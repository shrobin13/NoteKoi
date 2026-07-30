const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5000";

type RequestOptions = {
  params?: Record<string, unknown> | object | undefined;
  body?: unknown;
  data?: unknown;
  headers?: Record<string, string>;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
};

type ApiResponse<T = unknown> = {
  data: T;
  status: number;
};

function getStoredToken(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function setStoredTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("accessToken", accessToken);
  window.localStorage.setItem("refreshToken", refreshToken);
}

function clearStoredTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("accessToken");
  window.localStorage.removeItem("refreshToken");
  window.localStorage.removeItem("auth:user");
}

function buildUrl(path: string, params?: Record<string, unknown> | object) {
  const normalizedPath = path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const url = new URL(normalizedPath);

  const paramEntries = params && typeof params === "object" ? Object.entries(params as Record<string, unknown>) : [];

  paramEntries.forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, String(item)));
      return;
    }
    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  if (response.status === 204) return null;
  return response.text();
}

function toApiError(payload: unknown, status: number, path: string) {
  const nestedPayload = payload && typeof payload === "object" && "data" in payload
    ? (payload as { data?: unknown }).data
    : payload;
  const message = (payload as { message?: string })?.message
    ?? (nestedPayload && typeof nestedPayload === "object" && "message" in nestedPayload
      ? (nestedPayload as { message?: string }).message
      : undefined)
    ?? "Request failed";

  const error = new Error(message) as Error & {
    response?: { status: number; data: unknown };
    status?: number;
    config?: { url: string };
  };

  error.response = { status, data: payload };
  error.status = status;
  error.config = { url: path };
  return error;
}

async function refreshAccessToken() {
  const refreshToken = getStoredToken("refreshToken");
  if (!refreshToken) {
    clearStoredTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Missing refresh token");
  }

  const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const payload = await parseResponse(response);
  if (!response.ok) {
    clearStoredTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw toApiError(payload, response.status, "/api/auth/refresh");
  }

  const accessToken = payload?.data?.accessToken ?? payload?.accessToken;
  const nextRefreshToken = payload?.data?.refreshToken ?? payload?.refreshToken;

  if (!accessToken || !nextRefreshToken) {
    clearStoredTokens();
    throw new Error("Invalid refresh response");
  }

  setStoredTokens(accessToken, nextRefreshToken);
  return accessToken;
}

async function request<T = any>(path: string, options: RequestOptions = {}, retry = false): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  };

  const payload = options.body ?? options.data;
  if (!headers["Content-Type"] && payload !== undefined && payload !== null) {
    headers["Content-Type"] = "application/json";
  }

  const accessToken = getStoredToken("accessToken");
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(buildUrl(path, options.params), {
    method: options.method ?? "GET",
    headers,
    ...(payload !== undefined && payload !== null ? { body: JSON.stringify(payload) } : {}),
  });

  if (response.status === 401 && !retry && !path.includes("/api/auth/refresh")) {
    try {
      const newAccessToken = await refreshAccessToken();
      headers.Authorization = `Bearer ${newAccessToken}`;
      return request<T>(path, { ...options, headers }, true);
    } catch {
      throw new Error("Session expired. Please log in again.");
    }
  }

  const responsePayload = await parseResponse(response);
  if (!response.ok) {
    throw toApiError(responsePayload, response.status, path);
  }

  return {
    data: responsePayload as T,
    status: response.status,
  };
}

export const apiClient = {
  get: <T = any>(path: string, options: Omit<RequestOptions, "body" | "data" | "method"> = {}) => request<T>(path, { ...options, method: "GET" }),
  post: <T = any>(path: string, body?: unknown, options: Omit<RequestOptions, "body" | "data" | "method"> = {}) => request<T>(path, { ...options, body, method: "POST" }),
  patch: <T = any>(path: string, body?: unknown, options: Omit<RequestOptions, "body" | "data" | "method"> = {}) => request<T>(path, { ...options, body, method: "PATCH" }),
  delete: <T = any>(path: string, options: RequestOptions = {}) => request<T>(path, { ...options, method: "DELETE" }),
};

export default apiClient;
