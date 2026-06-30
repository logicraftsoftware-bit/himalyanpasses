/**
 * Centralized API utility
 * - Reads the JWT token from localStorage automatically
 * - Attaches Authorization header on all requests
 * - Use these helpers instead of raw fetch/axios in pages
 */

export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:4000' 
    : '');

/** Returns the stored auth token, or empty string */
export function getToken() {
  try {
    const user = JSON.parse(localStorage.getItem('glacier_user') || '{}');
    return user?.token || '';
  } catch {
    return '';
  }
}

/** Returns default headers that always include Authorization */
export function authHeaders(extra = {}) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
    ...extra,
  };
}

/** Returns multipart headers (no Content-Type â€” browser sets boundary) */
export function authMultipartHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${getToken()}`,
    ...extra,
  };
}

// â”€â”€â”€ Generic fetch wrappers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function handleResponse(res, path) {
  if (res.status === 401) {
    // Unauthorized - token might be expired
    localStorage.removeItem('glacier_user');
    // We don't throw here to allow the storage event to handle logout,
    // or we can throw to let the UI show an error.
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Session expired. Please login again.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `${res.method || 'Request'} ${path} failed`);
  }
  return res.json();
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res, path);
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res, path);
}

export async function apiPostForm(path, formData) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: authMultipartHeaders(),
    body: formData,
  });
  return handleResponse(res, path);
}

export async function apiPut(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res, path);
}

export async function apiPutForm(path, formData) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: authMultipartHeaders(),
    body: formData,
  });
  return handleResponse(res, path);
}

export async function apiPatch(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res, path);
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res, path);
}

