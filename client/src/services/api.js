import axiosLike from './fetchClient.js';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let token = null;

export const setToken = (t) => {
  token = t;
};

export const clearToken = () => {
  token = null;
};

const headers = () => {
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
};

export const api = {
  get: (path, config = {}) =>
    fetch(`${API_BASE}${path}`, { ...config, headers: headers() }).then(handleResponse),
  post: (path, body, config = {}) =>
    fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
      ...config,
    }).then(handleResponse),
  put: (path, body, config = {}) =>
    fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body),
      ...config,
    }).then(handleResponse),
  delete: (path, config = {}) =>
    fetch(`${API_BASE}${path}`, { method: 'DELETE', headers: headers(), ...config }).then(handleResponse),
};

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
