import axios from "axios";
import { API_URL, TOKEN_KEY } from "@/lib/constants";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("pacta_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Generic API helpers
export const get = <T>(url: string, params?: any) =>
  api.get<T>(url, { params }).then((r) => r.data);

export const post = <T>(url: string, data?: any) =>
  api.post<T>(url, data).then((r) => r.data);

export const put = <T>(url: string, data?: any) =>
  api.put<T>(url, data).then((r) => r.data);

export const patch = <T>(url: string, data?: any) =>
  api.patch<T>(url, data).then((r) => r.data);

export const del = <T>(url: string) =>
  api.delete<T>(url).then((r) => r.data);
