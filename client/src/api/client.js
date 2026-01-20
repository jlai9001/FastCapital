const API_BASE =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function apiFetch(path, options = {}) {
  const timeoutMs = options.timeoutMs ?? 12000; // 12s default
  const controller = new AbortController();

  // If caller already provided a signal, we should respect it.
  // We’ll abort *our* controller on timeout; if caller aborts, fetch aborts too.
  const externalSignal = options.signal;

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {

    const token = localStorage.getItem("access_token");

    // merge headers safely (caller headers win if they explicitly set Authorization)
    const mergedHeaders = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      ...options,
      headers: mergedHeaders,
      signal: externalSignal ?? controller.signal,
    });


    // ✅ Centralized auth failure handling
    if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("access_token");

    // notify app state to clear caches immediately
    window.dispatchEvent(new Event("fc:logout"));

    window.location.replace("/login");
    return response;
    }


    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
