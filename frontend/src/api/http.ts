import axios from "axios";

import { getToken, removeToken } from "../lib/token";
import { resolveApiBase } from "../lib/apiBase";

export const http = axios.create({
  baseURL: resolveApiBase(),
  timeout: 30000,
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);
