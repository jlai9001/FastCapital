const API_BASE =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
});

// 🔥 Redirect ONLY after next protected request fails
if (res.status === 401) {
window.location.replace('/login');
return;
}

return res;
}
