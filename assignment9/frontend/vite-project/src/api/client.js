import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// localStorage keys for the saved login
export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'auth_user';

const client = axios.create({ baseURL: API_BASE_URL });

// The Redux store is not imported here (avoids a circular import).
// main.jsx registers a logout handler instead.
let onUnauthorized = null;
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

const readToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

client.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 on a request that carried a token means the token is bad/expired.
    // (A 401 from the login call itself is just wrong credentials, so it is ignored.)
    const sentToken = Boolean(error.config?.headers?.Authorization);
    if (error.response?.status === 401 && sentToken) {
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } catch {
        // ignore storage errors
      }
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default client;
