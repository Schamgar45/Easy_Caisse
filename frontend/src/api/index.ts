/// <reference types="vite/client" />
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }
};

export const authAPI = {
  login: (data: { email: string; password: string }) => api.post("/auth/login/", data),
  register: (data: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    role?: string;
  }) => api.post("/auth/register/", data),
  logout: () => api.post("/auth/logout/"),
  me: () => api.get("/auth/me/"),
  refresh: (refresh: string) => api.post("/auth/token/refresh/", { refresh }),
};

export const produitAPI = {
  list: (params?: { page?: number; search?: string; categorie?: string; actif?: boolean }) =>
    api.get("/produits/", { params }),
  create: (data: any) => api.post("/produits/", data),
  get: (id: number) => api.get(`/produits/${id}/`),
  update: (id: number, data: any) => api.patch(`/produits/${id}/`, data),
  delete: (id: number) => api.delete(`/produits/${id}/`),
  stockBas: () => api.get("/produits/stock-bas/"),
  ajusterStock: (id: number, quantite: number, type: "entree" | "sortie") =>
    api.post(`/produits/${id}/ajuster-stock/`, { quantite, type }),
};

export const clientAPI = {
  list: (params?: { page?: number; search?: string }) => api.get("/clients/", { params }),
  create: (data: any) => api.post("/clients/", data),
  get: (id: number) => api.get(`/clients/${id}/`),
  update: (id: number, data: any) => api.patch(`/clients/${id}/`, data),
  delete: (id: number) => api.delete(`/clients/${id}/`),
};

export const venteAPI = {
  list: (params?: { page?: number; search?: string; date_debut?: string; date_fin?: string }) =>
    api.get("/ventes/", { params }),
  create: (data: any) => api.post("/ventes/", data),
  get: (id: number) => api.get(`/ventes/${id}/`),
  annuler: (id: number) => api.post(`/ventes/${id}/annuler/`),
  ticket: (id: number) => api.get(`/ventes/${id}/ticket/`),
  stats: () => api.get("/ventes/stats/"),
  ventesParJour: () => api.get("/ventes/par-jour/"),
  topProduits: () => api.get("/ventes/top-produits/"),
};

export const caisseAPI = {
  ouvrir: (data: { montant_initial: number }) => api.post("/caisse/ouvrir/", data),
  fermer: (data: { montant_fermeture: number }) => api.post("/caisse/fermer/", data),
  etat: () => api.get("/caisse/etat/"),
  historique: () => api.get("/caisse/historique/"),
};

export const dashboardAPI = {
  stats: () => api.get("/ventes/stats/"),
  activite: () => api.get("/ventes/par-jour/"),
  alertes: () => api.get("/produits/stock-bas/"),
};

export default api;
