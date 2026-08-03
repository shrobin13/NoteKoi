export function ok<T>(data: T, meta?: Record<string, unknown>) {
  return {
    success: true,
    data,
    meta: meta ?? {},
  };
}

export function created<T>(data: T, meta?: Record<string, unknown>) {
  return {
    success: true,
    data,
    meta: meta ?? {},
  };
}

export function noContent() {
  return {
    success: true,
    data: null,
    meta: {},
  };
}
