
export const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let token = localStorage.getItem('ra_token') || null;

const headers = () => {
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
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

export const api = {
  setToken(t) {
    token = t;
  },

  clearToken() {
    token = null;
  },

  get(path, config = {}) {
    return fetch(`${API_BASE}${path}`, {
      ...config,
      headers: { ...headers(), ...config.headers },
    }).then(handleResponse);
  },

  post(path, body, config = {}) {
    return fetch(`${API_BASE}${path}`, {
      method: 'POST',
      ...config,
      headers: { ...headers(), ...config.headers },
      body: JSON.stringify(body),
    }).then(handleResponse);
  },

  put(path, body, config = {}) {
    return fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      ...config,
      headers: { ...headers(), ...config.headers },
      body: JSON.stringify(body),
    }).then(handleResponse);
  },

  delete(path, config = {}) {
    return fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      ...config,
      headers: { ...headers(), ...config.headers },
    }).then(handleResponse);
  },
};
