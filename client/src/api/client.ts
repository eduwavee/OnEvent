import axios from "axios";

export const api = axios.create({ baseURL: "/api" });

const TOKEN_KEY = "gestion-eventos-token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Extrae un mensaje legible de un error de axios/API para mostrar en la UI. */
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string; details?: { message: string }[] } | undefined;
    if (data?.details?.length) return data.details.map((d) => d.message).join(", ");
    if (data?.error) return data.error;
  }
  return "Ocurrió un error inesperado";
}
